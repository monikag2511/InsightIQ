import os
import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from backend.main import app
from backend.app.database.session import Base, engine, SessionLocal
from backend.app.models.models import User
from backend.app.analysis.loader import load_dataset
from backend.app.analysis.profiler import profile_dataset, detect_outliers_iqr
from backend.app.analysis.cleaner import apply_cleaning_pipeline
from backend.app.analysis.statistics import compute_dataset_statistics
from backend.app.analysis.query_engine import execute_natural_query
from backend.app.utils.demo_generator import generate_demo_dataset

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "InsightIQ Analytics Engine"

def test_auth_registration_and_login():
    email = "analyst@insightiq.com"
    client.post("/api/auth/register", json={
        "name": "Data Analyst",
        "email": email,
        "password": "strongPassword123"
    })
    
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "strongPassword123"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == email

    # Test /api/auth/me
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Data Analyst"

def test_demo_dataset_endpoint_and_lifecycle():
    res = client.post("/api/datasets/demo")
    assert res.status_code == 200
    ds = res.json()
    assert ds["name"] == "Global Retail Sales Demo"
    assert ds["row_count"] > 1000
    assert ds["column_count"] == 10
    dataset_id = ds["id"]

    # 1. Preview test
    prev_res = client.get(f"/api/datasets/{dataset_id}/preview?page=1&page_size=10")
    assert prev_res.status_code == 200
    pdata = prev_res.json()
    assert len(pdata["rows"]) == 10
    assert "Sales" in pdata["columns"]
    assert "Profit" in pdata["columns"]

    # 2. Profile & Quality test
    prof_res = client.get(f"/api/datasets/{dataset_id}/profile")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["quality_score"] > 70
    assert prof["missing_values"] >= 0
    assert len(prof["columns"]) == 10

    # 3. Statistics test
    stats_res = client.get(f"/api/datasets/{dataset_id}/statistics")
    assert stats_res.status_code == 200
    sdata = stats_res.json()
    assert "Sales" in sdata["numerical"]
    assert "Category" in sdata["categorical"]
    assert "Sales" in sdata["correlation_matrix"]

    # 4. Visualizations test
    viz_res = client.get(f"/api/datasets/{dataset_id}/visualizations")
    assert viz_res.status_code == 200
    charts = viz_res.json()["charts"]
    assert len(charts) >= 3

    # 5. Insights test
    ins_res = client.get(f"/api/datasets/{dataset_id}/insights")
    assert ins_res.status_code == 200
    idata = ins_res.json()
    assert len(idata["insights"]) >= 3
    assert "### Dataset Overview" in idata["ai_summary"]

    # 6. Comprehensive Ask InsightIQ NLP Intents
    # Intent A: Average
    q_avg = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "What is the average revenue?"})
    assert q_avg.status_code == 200
    assert q_avg.json()["kpi"] is not None

    # Intent B: Groupby Category
    q_group = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "Which category has the highest sales?"})
    assert q_group.status_code == 200
    assert q_group.json()["chart"] is not None

    # Intent C: Top N
    q_top = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "Show me the top 5 products by sales"})
    assert q_top.status_code == 200
    assert q_top.json()["table"] is not None

    # Intent D: Correlations
    q_corr = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "What are the strongest correlations?"})
    assert q_corr.status_code == 200
    assert "correlation" in q_corr.json()["executed_intent"]

    # Intent E: Outliers
    q_outliers = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "Are there any outliers in this data?"})
    assert q_outliers.status_code == 200

    # Intent F: Dataset Summary
    q_summary = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "Summarize this dataset"})
    assert q_summary.status_code == 200

    # Intent G: Filter
    q_filter = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": "Show orders with sales above 1000"})
    assert q_filter.status_code == 200

    # 7. Conversational History
    hist_res = client.get(f"/api/datasets/{dataset_id}/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

    # 8. Cleaning pipeline test
    clean_res = client.post(f"/api/datasets/{dataset_id}/clean", json={"auto_clean": True})
    assert clean_res.status_code == 200
    cdata = clean_res.json()
    assert len(cdata["changes_applied"]) > 0

    # 9. Report generation test
    rep_res = client.post(f"/api/datasets/{dataset_id}/report", json={"report_name": "Retail Executive Report"})
    assert rep_res.status_code == 200
    rdata = rep_res.json()
    assert os.path.exists(rdata["file_path"])

    # 10. Exports test (CSV and Excel)
    exp_csv = client.get(f"/api/datasets/{dataset_id}/export?format=csv")
    assert exp_csv.status_code == 200
    assert exp_csv.headers["content-type"].startswith("text/csv")

    exp_xlsx = client.get(f"/api/datasets/{dataset_id}/export?format=excel")
    assert exp_xlsx.status_code == 200
    assert "spreadsheet" in exp_xlsx.headers["content-type"]

def test_file_upload_csv():
    csv_content = b"Product,Price,Quantity\nWidget A,19.99,10\nWidget B,29.99,5\nWidget C,9.99,20\n"
    files = {"file": ("test_inventory.csv", csv_content, "text/csv")}
    res = client.post("/api/datasets/upload", files=files, data={"name": "Test Inventory"})
    assert res.status_code == 200
    data = res.json()
    assert data["row_count"] == 3
    assert data["column_count"] == 3

def test_file_upload_json():
    json_content = b'[{"city": "New York", "population": 8400000}, {"city": "Los Angeles", "population": 3900000}]'
    files = {"file": ("cities.json", json_content, "application/json")}
    res = client.post("/api/datasets/upload", files=files, data={"name": "Cities Population"})
    assert res.status_code == 200
    data = res.json()
    assert data["row_count"] == 2
    assert data["column_count"] == 2

def test_file_upload_excel():
    # Generate an Excel file buffer with openpyxl
    df = pd.DataFrame({
        "Employee": ["Alice", "Bob", "Charlie"],
        "Department": ["Engineering", "Product", "Sales"],
        "Salary": [120000, 110000, 95000]
    })
    buf = io.BytesIO()
    df.to_excel(buf, index=False, engine="openpyxl")
    buf.seek(0)

    files = {"file": ("staff.xlsx", buf.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    res = client.post("/api/datasets/upload", files=files, data={"name": "Staff Directory"})
    assert res.status_code == 200
    data = res.json()
    assert data["row_count"] == 3
    assert data["column_count"] == 3
    assert data["file_type"] == "xlsx"

def test_profiler_and_outliers():
    s = pd.Series([10, 12, 11, 13, 12, 11, 14, 12, 100]) # 100 is outlier
    outliers = detect_outliers_iqr(s)
    assert outliers["outlier_count"] == 1
    assert outliers["upper_bound"] < 100

def test_demo_datasets_multi_type():
    # SaaS demo dataset
    saas_res = client.post("/api/datasets/demo?type=saas")
    assert saas_res.status_code == 200
    saas_data = saas_res.json()
    assert saas_data["name"] == "B2B SaaS Subscriptions & Churn"
    assert saas_data["row_count"] > 100

    # Workforce demo dataset
    wf_res = client.post("/api/datasets/demo?type=workforce")
    assert wf_res.status_code == 200
    wf_data = wf_res.json()
    assert wf_data["name"] == "Enterprise Workforce & Compensation"
    assert wf_data["row_count"] > 100

def test_ask_your_data_exact_suggested_questions():
    res = client.post("/api/datasets/demo?type=retail")
    assert res.status_code == 200
    dataset_id = res.json()["id"]

    questions = [
        "What is the average revenue?",
        "Which category has the highest sales?",
        "Show the top 10 customers.",
        "Which month had the highest sales?",
        "What are the strongest correlations?",
        "Are there any unusual values?",
        "Summarize this dataset.",
        "Show customers with revenue greater than 50000.",
        "Which region performs best?",
        "What percentage of sales comes from the top 10 products?"
    ]

    for q in questions:
        q_res = client.post(f"/api/datasets/{dataset_id}/ask", json={"question": q})
        assert q_res.status_code == 200, f"Query '{q}' failed with {q_res.status_code}"
        data = q_res.json()
        assert "answer" in data
        assert len(data["answer"]) > 0
        assert data["executed_intent"] is not None


