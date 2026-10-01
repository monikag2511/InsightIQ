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

def test_demo_dataset_endpoint():
    res = client.post("/api/datasets/demo")
    assert res.status_code == 200
    ds = res.json()
    assert ds["name"] == "Global Retail Sales Demo"
    assert ds["row_count"] > 1000
    assert ds["column_count"] == 10
    dataset_id = ds["id"]

    # Preview test
    prev_res = client.get(f"/api/datasets/{dataset_id}/preview?page=1&page_size=10")
    assert prev_res.status_code == 200
    pdata = prev_res.json()
    assert len(pdata["rows"]) == 10
    assert "Sales" in pdata["columns"]
    assert "Profit" in pdata["columns"]

    # Profile & Quality test
    prof_res = client.get(f"/api/datasets/{dataset_id}/profile")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["quality_score"] > 70
    assert prof["missing_values"] >= 0
    assert len(prof["columns"]) == 10

    # Statistics test
    stats_res = client.get(f"/api/datasets/{dataset_id}/statistics")
    assert stats_res.status_code == 200
    sdata = stats_res.json()
    assert "Sales" in sdata["numerical"]
    assert "Category" in sdata["categorical"]
    assert "Sales" in sdata["correlation_matrix"]

    # Visualizations test
    viz_res = client.get(f"/api/datasets/{dataset_id}/visualizations")
    assert viz_res.status_code == 200
    charts = viz_res.json()["charts"]
    assert len(charts) >= 3

    # Insights test
    ins_res = client.get(f"/api/datasets/{dataset_id}/insights")
    assert ins_res.status_code == 200
    idata = ins_res.json()
    assert len(idata["insights"]) >= 3
    assert "### Dataset Overview" in idata["ai_summary"]

    # Ask InsightIQ query engine test
    ask_res = client.post(f"/api/datasets/{dataset_id}/ask", json={
        "question": "What is the average revenue?"
    })
    assert ask_res.status_code == 200
    adata = ask_res.json()
    assert adata["kpi"] is not None
    assert "$" in adata["answer"]

    # Ask categorical grouping query
    ask_cat = client.post(f"/api/datasets/{dataset_id}/ask", json={
        "question": "Which category has the highest sales?"
    })
    assert ask_cat.status_code == 200
    assert ask_cat.json()["chart"] is not None

    # Cleaning pipeline test
    clean_res = client.post(f"/api/datasets/{dataset_id}/clean", json={
        "auto_clean": True
    })
    assert clean_res.status_code == 200
    cdata = clean_res.json()
    assert len(cdata["changes_applied"]) > 0

    # Report generation test
    rep_res = client.post(f"/api/datasets/{dataset_id}/report", json={
        "report_name": "Retail Performance Report"
    })
    assert rep_res.status_code == 200
    rdata = rep_res.json()
    assert os.path.exists(rdata["file_path"])

    # Export test
    exp_csv = client.get(f"/api/datasets/{dataset_id}/export?format=csv")
    assert exp_csv.status_code == 200
    assert exp_csv.headers["content-type"].startswith("text/csv")

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

def test_profiler_and_outliers():
    s = pd.Series([10, 12, 11, 13, 12, 11, 14, 12, 100]) # 100 is outlier
    outliers = detect_outliers_iqr(s)
    assert outliers["outlier_count"] == 1
    assert outliers["upper_bound"] < 100
