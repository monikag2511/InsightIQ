import os
import shutil
import json
import datetime
from typing import Optional, List
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import User, Dataset, DatasetProfile, Conversation, Message, Report
from backend.app.schemas.schemas import (
    DatasetResponse, DatasetProfileResponse, PreviewResponse,
    CleaningRequest, CleaningResponse, StatisticsResponse,
    VisualizationsResponse, InsightsResponse, AskRequest, AskResponse,
    ConversationHistoryResponse, ReportGenerateRequest, ReportResponse
)
from backend.app.services.auth import get_optional_current_user
from backend.app.analysis.loader import load_dataset, save_cleaned_dataset
from backend.app.analysis.profiler import profile_dataset, infer_column_type
from backend.app.analysis.cleaner import apply_cleaning_pipeline
from backend.app.analysis.statistics import compute_dataset_statistics
from backend.app.analysis.visualizer import generate_visualizations
from backend.app.analysis.insights import generate_dataset_insights
from backend.app.ai.llm_service import ask_insightiq, generate_ai_dataset_summary
from backend.app.services.report_generator import generate_pdf_report
from backend.app.utils.demo_generator import generate_demo_dataset

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/uploads"))
REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/reports"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

def get_active_dataframe(dataset: Dataset) -> pd.DataFrame:
    """Helper to load either the cleaned file or original file for a dataset."""
    target_path = dataset.cleaned_file_path if (dataset.cleaned_file_path and os.path.exists(dataset.cleaned_file_path)) else dataset.file_path
    
    # Auto-heal missing demo/sales/retail datasets if server container restarted on ephemeral storage
    if not target_path or not os.path.exists(target_path):
        is_demo = (
            (target_path and ("demo" in target_path.lower() or "retail" in target_path.lower() or "sales" in target_path.lower())) or
            (dataset.name and any(k in dataset.name.lower() for k in ["demo", "retail", "sales", "saas", "workforce", "insightiq"])) or
            (dataset.file_name and any(k in dataset.file_name.lower() for k in ["demo", "retail", "sales", "sample"]))
        )
        if is_demo and target_path:
            try:
                os.makedirs(os.path.dirname(target_path), exist_ok=True)
                from backend.app.utils.demo_generator import generate_demo_dataset
                generate_demo_dataset(1200, target_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to auto-generate demo data: {str(e)}")
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Dataset file '{dataset.file_name or dataset.name}' not found on server storage (ephemeral container restart). Please re-upload your file or select a Demo dataset."
            )

    return load_dataset(target_path, dataset.file_type)

def serialize_numpy(obj):
    if isinstance(obj, (np.integer, int)):
        return int(obj)
    elif isinstance(obj, (np.floating, float)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return str(obj)

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # Validate extension
    filename = file.filename or "uploaded_dataset"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".csv", ".xlsx", ".xls", ".json"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. InsightIQ supports: CSV, XLSX, XLS, and JSON."
        )

    # Save to disk
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Check file size (e.g. limit 50MB)
    file_size = os.path.getsize(file_path)
    if file_size == 0:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes).")
    if file_size > 50 * 1024 * 1024:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="File size exceeds the 50MB platform limit.")

    # Parse and validate with Pandas
    try:
        df = load_dataset(file_path, ext.lstrip('.'))
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse dataset: {str(e)}")

    dataset_name = name or os.path.splitext(filename)[0].replace("_", " ").title()

    # Save Dataset record
    ds_record = Dataset(
        user_id=current_user.id if current_user else None,
        name=dataset_name,
        file_name=filename,
        file_type=ext.lstrip('.'),
        row_count=len(df),
        column_count=len(df.columns),
        file_path=file_path
    )
    db.add(ds_record)
    db.commit()
    db.refresh(ds_record)

    # Profile dataset automatically
    profile_data = profile_dataset(df)
    ds_profile = DatasetProfile(
        dataset_id=ds_record.id,
        missing_values=profile_data["missing_values"],
        duplicate_rows=profile_data["duplicate_rows"],
        quality_score=profile_data["quality_score"],
        profile_json=json.dumps(profile_data)
    )
    db.add(ds_profile)
    db.commit()

    return ds_record

@router.post("/demo", response_model=DatasetResponse)
def load_demo_dataset_endpoint(
    type: str = Query("retail", description="Demo dataset type: 'retail', 'saas', or 'workforce'"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    demo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo"))
    
    demo_configs = {
        "retail": {
            "filename": "retail_sales_demo.csv",
            "name": "Global Retail Sales Demo",
            "ext": "csv"
        },
        "saas": {
            "filename": "saas_subscriptions_demo.csv",
            "name": "B2B SaaS Subscriptions & Churn",
            "ext": "csv"
        },
        "workforce": {
            "filename": "employee_workforce_demo.csv",
            "name": "Enterprise Workforce & Compensation",
            "ext": "csv"
        }
    }
    
    config = demo_configs.get(type.lower(), demo_configs["retail"])
    demo_file = os.path.join(demo_dir, config["filename"])
    
    if not os.path.exists(demo_file) and config["filename"] == "retail_sales_demo.csv":
        generate_demo_dataset(1200, demo_file)
    elif not os.path.exists(demo_file):
        raise HTTPException(status_code=404, detail=f"Demo file '{config['filename']}' not found on server.")

    # Copy demo dataset to uploads
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    copy_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{config['filename']}")
    shutil.copyfile(demo_file, copy_path)

    df = load_dataset(copy_path, config["ext"])

    ds_record = Dataset(
        user_id=current_user.id if current_user else None,
        name=config["name"],
        file_name=config["filename"],
        file_type=config["ext"],
        row_count=len(df),
        column_count=len(df.columns),
        file_path=copy_path
    )
    db.add(ds_record)
    db.commit()
    db.refresh(ds_record)

    profile_data = profile_dataset(df)
    ds_profile = DatasetProfile(
        dataset_id=ds_record.id,
        missing_values=profile_data["missing_values"],
        duplicate_rows=profile_data["duplicate_rows"],
        quality_score=profile_data["quality_score"],
        profile_json=json.dumps(profile_data)
    )
    db.add(ds_profile)
    db.commit()

    return ds_record

@router.get("", response_model=List[DatasetResponse])
def list_datasets(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user:
        return db.query(Dataset).filter(
            (Dataset.user_id == current_user.id) | (Dataset.user_id == None)
        ).order_by(Dataset.created_at.desc()).all()
    return db.query(Dataset).order_by(Dataset.created_at.desc()).limit(20).all()

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@router.get("/{dataset_id}/preview", response_model=PreviewResponse)
def get_dataset_preview(
    dataset_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("asc"),
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = get_active_dataframe(ds)

    # Search filter
    if search:
        search_lower = search.strip().lower()
        mask = df.astype(str).apply(lambda row: row.str.lower().str.contains(search_lower, regex=False)).any(axis=1)
        df = df[mask]

    # Sort
    if sort_by and sort_by in df.columns:
        ascending = (sort_order.lower() == "asc")
        df = df.sort_values(by=sort_by, ascending=ascending)

    total_rows = len(df)
    total_pages = max(1, (total_rows + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    paged_df = df.iloc[offset : offset + page_size]

    # Clean NaN / inf to None for JSON
    rows = paged_df.replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient="records")
    col_types = {col: infer_column_type(df[col]) for col in df.columns}

    return {
        "columns": list(df.columns),
        "column_types": col_types,
        "rows": rows,
        "total_rows": total_rows,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{dataset_id}/profile", response_model=DatasetProfileResponse)
def get_dataset_profile(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    profile_rec = db.query(DatasetProfile).filter(DatasetProfile.dataset_id == dataset_id).first()
    if not profile_rec or not profile_rec.profile_json:
        df = get_active_dataframe(ds)
        p_data = profile_dataset(df)
        if not profile_rec:
            profile_rec = DatasetProfile(dataset_id=dataset_id, profile_json=json.dumps(p_data))
            db.add(profile_rec)
        else:
            profile_rec.profile_json = json.dumps(p_data)
        profile_rec.missing_values = p_data["missing_values"]
        profile_rec.duplicate_rows = p_data["duplicate_rows"]
        profile_rec.quality_score = p_data["quality_score"]
        db.commit()
    else:
        p_data = json.loads(profile_rec.profile_json)

    p_data["dataset_id"] = dataset_id
    return p_data

@router.post("/{dataset_id}/clean", response_model=CleaningResponse)
def clean_dataset_endpoint(
    dataset_id: int,
    clean_req: CleaningRequest,
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df_original = load_dataset(ds.file_path, ds.file_type)
    rows_before = len(df_original)
    cols_before = len(df_original.columns)
    score_before = ds.profile.quality_score if ds.profile else 80.0

    ops = [op.dict() for op in clean_req.operations] if clean_req.operations else []
    cleaned_df, changes = apply_cleaning_pipeline(df_original, operations=ops, auto_clean=clean_req.auto_clean)

    # Save cleaned file
    cleaned_path = save_cleaned_dataset(cleaned_df, ds.file_path)
    ds.cleaned_file_path = cleaned_path
    ds.row_count = len(cleaned_df)
    ds.column_count = len(cleaned_df.columns)
    ds.updated_at = datetime.datetime.utcnow()

    # Re-profile
    new_profile = profile_dataset(cleaned_df)
    if ds.profile:
        ds.profile.missing_values = new_profile["missing_values"]
        ds.profile.duplicate_rows = new_profile["duplicate_rows"]
        ds.profile.quality_score = new_profile["quality_score"]
        ds.profile.profile_json = json.dumps(new_profile)

    db.commit()

    return {
        "dataset_id": dataset_id,
        "rows_before": rows_before,
        "rows_after": len(cleaned_df),
        "columns_before": cols_before,
        "columns_after": len(cleaned_df.columns),
        "changes_applied": changes,
        "quality_score_before": score_before,
        "quality_score_after": new_profile["quality_score"]
    }

@router.get("/{dataset_id}/statistics", response_model=StatisticsResponse)
def get_dataset_statistics(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    df = get_active_dataframe(ds)
    stats = compute_dataset_statistics(df)
    return stats

@router.get("/{dataset_id}/visualizations", response_model=VisualizationsResponse)
def get_dataset_visualizations(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    df = get_active_dataframe(ds)
    charts = generate_visualizations(df)
    return {"charts": charts}

@router.get("/{dataset_id}/insights", response_model=InsightsResponse)
def get_dataset_insights_endpoint(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    df = get_active_dataframe(ds)
    insights = generate_dataset_insights(df)
    stats = compute_dataset_statistics(df)
    profile = json.loads(ds.profile.profile_json) if (ds.profile and ds.profile.profile_json) else profile_dataset(df)
    ai_summary = generate_ai_dataset_summary(df, profile, stats, insights)
    return {"insights": insights, "ai_summary": ai_summary}

@router.post("/{dataset_id}/ask", response_model=AskResponse)
async def ask_dataset_question(
    dataset_id: int,
    request: AskRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = get_active_dataframe(ds)

    # Retrieve or create conversation
    conv = None
    if request.conversation_id:
        conv = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
    if not conv:
        conv = Conversation(
            user_id=current_user.id if current_user else None,
            dataset_id=dataset_id,
            title=request.question[:45] + ("..." if len(request.question) > 45 else "")
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=request.question,
        response_type="text"
    )
    db.add(user_msg)
    db.commit()

    # Query Engine execution
    computed_res = await ask_insightiq(request.question, df)

    # Package payload
    payload_dict = {
        "kpi": computed_res.get("kpi"),
        "table": computed_res.get("table"),
        "chart": computed_res.get("chart"),
        "executed_intent": computed_res.get("executed_intent"),
        "mode": computed_res.get("mode"),
        "provider": computed_res.get("provider"),
        "model": computed_res.get("model"),
        "ai_error": computed_res.get("ai_error"),
        "disclaimer": computed_res.get("disclaimer")
    }

    # Save assistant message
    asst_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=computed_res["answer"],
        response_type=computed_res.get("response_type", "text"),
        payload_json=json.dumps(payload_dict, default=serialize_numpy)
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    return {
        "answer": computed_res["answer"],
        "response_type": computed_res.get("response_type", "text"),
        "kpi": computed_res.get("kpi"),
        "table": computed_res.get("table"),
        "chart": computed_res.get("chart"),
        "conversation_id": conv.id,
        "message_id": asst_msg.id,
        "executed_intent": computed_res.get("executed_intent", "custom"),
        "mode": computed_res.get("mode", "builtin_engine"),
        "provider": computed_res.get("provider"),
        "model": computed_res.get("model"),
        "ai_error": computed_res.get("ai_error"),
        "disclaimer": computed_res.get("disclaimer")
    }

@router.get("/{dataset_id}/history", response_model=List[ConversationHistoryResponse])
def get_conversations(dataset_id: int, db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(Conversation.dataset_id == dataset_id).order_by(Conversation.created_at.desc()).all()
    res = []
    for c in convs:
        msgs = []
        for m in c.messages:
            msgs.append({
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "response_type": m.response_type,
                "payload_json": m.payload_json,
                "created_at": m.created_at
            })
        res.append({
            "id": c.id,
            "dataset_id": c.dataset_id,
            "title": c.title,
            "messages": msgs,
            "created_at": c.created_at
        })
    return res

@router.delete("/{dataset_id}/history", status_code=204)
def clear_history(dataset_id: int, db: Session = Depends(get_db)):
    db.query(Conversation).filter(Conversation.dataset_id == dataset_id).delete()
    db.commit()
    return None

@router.post("/{dataset_id}/report", response_model=ReportResponse)
def create_report(
    dataset_id: int,
    req: ReportGenerateRequest,
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = get_active_dataframe(ds)
    profile = json.loads(ds.profile.profile_json) if (ds.profile and ds.profile.profile_json) else profile_dataset(df)
    stats = compute_dataset_statistics(df)
    insights = generate_dataset_insights(df)
    ai_summary = generate_ai_dataset_summary(df, profile, stats, insights)

    report_title = req.report_name or f"{ds.name} Executive Report"
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"InsightIQ_Report_{dataset_id}_{timestamp}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)

    generate_pdf_report(
        output_pdf_path=pdf_path,
        dataset_name=ds.name,
        profile=profile,
        stats=stats,
        insights=insights,
        ai_summary=ai_summary
    )

    report_record = Report(
        dataset_id=dataset_id,
        report_name=report_title,
        file_path=pdf_path,
        report_json=json.dumps({"summary": ai_summary, "insights_count": len(insights)})
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return report_record

@router.get("/{dataset_id}/reports/{report_id}/download")
def download_report(dataset_id: int, report_id: int, db: Session = Depends(get_db)):
    rep = db.query(Report).filter(Report.id == report_id, Report.dataset_id == dataset_id).first()
    if not rep or not os.path.exists(rep.file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(
        rep.file_path,
        media_type="application/pdf",
        filename=os.path.basename(rep.file_path)
    )

@router.get("/{dataset_id}/export")
def export_dataset(
    dataset_id: int,
    format: str = Query("csv", pattern="^(csv|excel)$"),
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = get_active_dataframe(ds)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = ds.name.replace(" ", "_")

    if format == "csv":
        out_name = f"{safe_name}_export_{timestamp}.csv"
        out_path = os.path.join(UPLOAD_DIR, out_name)
        df.to_csv(out_path, index=False)
        return FileResponse(out_path, media_type="text/csv", filename=out_name)
    else:
        out_name = f"{safe_name}_export_{timestamp}.xlsx"
        out_path = os.path.join(UPLOAD_DIR, out_name)
        df.to_excel(out_path, index=False)
        return FileResponse(out_path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=out_name)

@router.delete("/{dataset_id}", status_code=204)
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Clean files
    if os.path.exists(ds.file_path):
        try: os.remove(ds.file_path)
        except Exception: pass
    if ds.cleaned_file_path and os.path.exists(ds.cleaned_file_path):
        try: os.remove(ds.cleaned_file_path)
        except Exception: pass

    db.delete(ds)
    db.commit()
    return None
