import io
import os
import json
import pandas as pd
from typing import Tuple

def load_dataset(file_path: str, file_type: str = None) -> pd.DataFrame:
    """
    Safely loads a dataset from CSV, XLSX, XLS, or JSON.
    Validates non-empty content and handles encoding/delimiter quirks.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if os.path.getsize(file_path) == 0:
        raise ValueError("The uploaded file is completely empty.")

    ext = os.path.splitext(file_path)[1].lower() if not file_type else f".{file_type.lower().strip('.')}"

    try:
        if ext == ".csv":
            # Attempt default utf-8, fallback to latin1
            try:
                df = pd.read_csv(file_path, sep=None, engine="python")
            except Exception:
                df = pd.read_csv(file_path, encoding="latin1")
        elif ext in [".xlsx", ".xls"]:
            df = pd.read_excel(file_path)
        elif ext == ".json":
            try:
                df = pd.read_json(file_path)
            except Exception:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict):
                    # Check if there is a primary list key
                    for k, v in data.items():
                        if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                            df = pd.DataFrame(v)
                            break
                    else:
                        df = pd.DataFrame([data])
                elif isinstance(data, list):
                    df = pd.DataFrame(data)
                else:
                    raise ValueError("Unsupported JSON structure")
        else:
            raise ValueError(f"Unsupported file format: {ext}. InsightIQ supports CSV, XLSX, XLS, and JSON.")

        if df.empty:
            raise ValueError("The dataset contains zero rows.")

        return df

    except Exception as e:
        raise ValueError(f"Failed to parse dataset: {str(e)}")

def save_cleaned_dataset(df: pd.DataFrame, original_file_path: str) -> str:
    """
    Saves a cleaned DataFrame to disk alongside the original file.
    """
    base, ext = os.path.splitext(original_file_path)
    cleaned_path = f"{base}_cleaned{ext}"
    if ext.lower() == ".csv":
        df.to_csv(cleaned_path, index=False)
    elif ext.lower() in [".xlsx", ".xls"]:
        df.to_excel(cleaned_path, index=False)
    elif ext.lower() == ".json":
        df.to_json(cleaned_path, orient="records", indent=2)
    else:
        df.to_csv(cleaned_path, index=False)
    return cleaned_path
