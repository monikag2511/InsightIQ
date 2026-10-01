import os
import json
import shutil
from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal
from backend.app.models.models import User, Dataset, DatasetProfile
from backend.app.services.auth import hash_password
from backend.app.analysis.loader import load_dataset
from backend.app.analysis.profiler import profile_dataset
from backend.app.utils.demo_generator import generate_demo_dataset

def seed_initial_data():
    """
    Automatically populates a fresh database (e.g. Neon PostgreSQL on first deploy)
    with a demo user and a high-quality demo dataset so the platform is immediately
    interactive on first launch.
    """
    db = SessionLocal()
    try:
        # 1. Seed demo user if no users exist
        demo_user_id = None
        if db.query(User).count() == 0:
            demo_user = User(
                name="Data Analyst",
                email="analyst@insightiq.com",
                password_hash=hash_password("password123")
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            demo_user_id = demo_user.id
            print(f"Auto-seed: Created initial user {demo_user.email}")
        else:
            first_user = db.query(User).first()
            demo_user_id = first_user.id if first_user else None

        # 2. Seed demo dataset if no datasets exist
        if db.query(Dataset).count() == 0:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
            demo_dir = os.path.join(base_dir, "demo")
            upload_dir = os.path.join(base_dir, "uploads")
            os.makedirs(demo_dir, exist_ok=True)
            os.makedirs(upload_dir, exist_ok=True)

            demo_csv = os.path.join(demo_dir, "retail_sales_demo.csv")
            if not os.path.exists(demo_csv):
                generate_demo_dataset(1200, demo_csv)

            dest_csv = os.path.join(upload_dir, "initial_retail_sales_demo.csv")
            shutil.copyfile(demo_csv, dest_csv)

            df = load_dataset(dest_csv, "csv")
            ds = Dataset(
                user_id=demo_user_id,
                name="Global Retail Sales Demo",
                file_name="retail_sales_demo.csv",
                file_type="csv",
                row_count=len(df),
                column_count=len(df.columns),
                file_path=dest_csv
            )
            db.add(ds)
            db.commit()
            db.refresh(ds)

            profile_data = profile_dataset(df)
            profile_record = DatasetProfile(
                dataset_id=ds.id,
                missing_values=profile_data.get("missing_values", 0),
                duplicate_rows=profile_data.get("duplicate_rows", 0),
                quality_score=profile_data.get("quality_score", 95.0),
                profile_json=json.dumps(profile_data)
            )
            db.add(profile_record)
            db.commit()
            print(f"Auto-seed: Initialized demo dataset '{ds.name}' ({len(df)} rows)")
        else:
            # Auto-heal any existing datasets whose files were wiped by ephemeral container restarts
            for existing_ds in db.query(Dataset).all():
                target = existing_ds.file_path
                if target and not os.path.exists(target):
                    is_demo = (
                        "demo" in target.lower() or
                        "retail" in str(existing_ds.name).lower() or
                        "sales" in str(existing_ds.name).lower() or
                        "insightiq" in target.lower()
                    )
                    if is_demo:
                        try:
                            os.makedirs(os.path.dirname(target), exist_ok=True)
                            generate_demo_dataset(1200, target)
                            print(f"Auto-heal: Restored missing dataset file for '{existing_ds.name}' at {target}")
                        except Exception as e:
                            print(f"Auto-heal notice for {target}: {e}")
    except Exception as e:
        print(f"Auto-seed non-fatal notice: {e}")
    finally:
        db.close()
