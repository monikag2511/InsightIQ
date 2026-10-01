import pandas as pd
import numpy as np
from typing import Dict, Any, List

def infer_column_type(series: pd.Series) -> str:
    """
    Classifies a column into: 'numerical', 'categorical', 'boolean', 'datetime', or 'text'.
    """
    # Check for boolean
    if pd.api.types.is_bool_dtype(series):
        return "boolean"
    if series.nunique(dropna=True) == 2 and set(series.dropna().unique()).issubset({0, 1, "0", "1", "true", "false", "True", "False", True, False}):
        return "boolean"

    # Check for numerical
    if pd.api.types.is_numeric_dtype(series):
        # If low cardinality integers, check if it behaves as categorical
        if series.nunique(dropna=True) <= 5 and series.dtype in ['int64', 'int32']:
            return "categorical"
        return "numerical"

    # Check for datetime
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    
    # Try parsing sample strings as datetime
    non_null_sample = series.dropna().astype(str).head(50)
    if not non_null_sample.empty:
        try:
            # Check if looks like a date format
            sample_dates = pd.to_datetime(non_null_sample, errors='coerce', format='mixed')
            if sample_dates.notna().sum() / len(non_null_sample) > 0.8:
                return "datetime"
        except Exception:
            pass

    # Check for categorical vs text
    unique_count = series.nunique(dropna=True)
    total_count = len(series.dropna())
    if total_count > 0:
        ratio = unique_count / total_count
        avg_len = series.dropna().astype(str).str.len().mean()
        if (ratio < 0.25 and avg_len < 60) or unique_count <= 25:
            return "categorical"

    return "text"

def detect_outliers_iqr(series: pd.Series) -> Dict[str, Any]:
    """
    Detects outliers using the Interquartile Range (IQR) method.
    """
    clean_series = pd.to_numeric(series.dropna(), errors='coerce').dropna()
    if len(clean_series) < 5:
        return {"outlier_count": 0, "outlier_pct": 0.0, "lower_bound": 0.0, "upper_bound": 0.0}

    q25 = float(np.percentile(clean_series, 25))
    q75 = float(np.percentile(clean_series, 75))
    iqr = q75 - q25

    lower_bound = q25 - (1.5 * iqr)
    upper_bound = q75 + (1.5 * iqr)

    outliers = clean_series[(clean_series < lower_bound) | (clean_series > upper_bound)]
    outlier_count = int(len(outliers))
    outlier_pct = round((outlier_count / len(clean_series)) * 100.0, 2)

    return {
        "outlier_count": outlier_count,
        "outlier_pct": outlier_pct,
        "lower_bound": round(lower_bound, 2),
        "upper_bound": round(upper_bound, 2)
    }

def profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generates a comprehensive dataset profile including column types,
    missing values, duplicates, outliers, and data quality score.
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols if total_cols > 0 else 1

    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / total_rows * 100.0), 2) if total_rows > 0 else 0.0

    total_missing = int(df.isna().sum().sum())
    missing_pct = round((total_missing / total_cells * 100.0), 2)

    columns_profile = []
    missing_breakdown = []
    outliers_breakdown = []

    total_outliers = 0
    num_numeric_cols = 0

    for col in df.columns:
        series = df[col]
        col_type = infer_column_type(series)
        missing_count = int(series.isna().sum())
        col_missing_pct = round((missing_count / total_rows * 100.0), 2) if total_rows > 0 else 0.0
        unique_count = int(series.nunique(dropna=True))

        # Sample values (up to 4 non-null unique representations)
        sample_vals = series.dropna().unique()[:4].tolist()
        # Convert non-serializable types to strings or native python types
        clean_samples = []
        for v in sample_vals:
            if isinstance(v, (np.integer, int)):
                clean_samples.append(int(v))
            elif isinstance(v, (np.floating, float)):
                clean_samples.append(round(float(v), 2))
            else:
                clean_samples.append(str(v))

        col_dict = {
            "name": str(col),
            "data_type": str(series.dtype),
            "general_type": col_type,
            "missing_count": missing_count,
            "missing_pct": col_missing_pct,
            "unique_count": unique_count,
            "example_values": clean_samples,
            "min": None,
            "max": None,
            "mean": None,
            "std": None
        }

        if missing_count > 0:
            missing_breakdown.append({
                "column": str(col),
                "missing_count": missing_count,
                "missing_pct": col_missing_pct
            })

        if col_type == "numerical":
            num_numeric_cols += 1
            num_series = pd.to_numeric(series.dropna(), errors='coerce').dropna()
            if not num_series.empty:
                col_dict["min"] = round(float(num_series.min()), 2)
                col_dict["max"] = round(float(num_series.max()), 2)
                col_dict["mean"] = round(float(num_series.mean()), 2)
                col_dict["std"] = round(float(num_series.std()), 2) if len(num_series) > 1 else 0.0

                outlier_info = detect_outliers_iqr(num_series)
                if outlier_info["outlier_count"] > 0:
                    outliers_breakdown.append({
                        "column": str(col),
                        "outlier_count": outlier_info["outlier_count"],
                        "outlier_pct": outlier_info["outlier_pct"],
                        "lower_bound": outlier_info["lower_bound"],
                        "upper_bound": outlier_info["upper_bound"]
                    })
                    total_outliers += outlier_info["outlier_count"]

        columns_profile.append(col_dict)

    # Calculate Data Quality Score (0 to 100)
    # Deductions:
    # 1. Missingness: each 1% missingness takes 1.5 points (max 40)
    # 2. Duplicates: each 1% duplicate rows takes 2 points (max 30)
    # 3. Outliers: moderate deduction (max 15)
    missing_deduction = min(40.0, (total_missing / total_cells) * 150.0)
    dup_deduction = min(30.0, (duplicate_rows / total_rows * 100.0) * 1.5) if total_rows > 0 else 0.0
    outlier_ratio = (total_outliers / (total_rows * max(1, num_numeric_cols))) if total_rows > 0 else 0.0
    outlier_deduction = min(15.0, outlier_ratio * 100.0 * 0.8)

    quality_score = max(5.0, min(100.0, round(100.0 - missing_deduction - dup_deduction - outlier_deduction, 1)))

    return {
        "row_count": total_rows,
        "column_count": total_cols,
        "missing_values": total_missing,
        "missing_pct": missing_pct,
        "duplicate_rows": duplicate_rows,
        "duplicate_pct": duplicate_pct,
        "quality_score": quality_score,
        "columns": columns_profile,
        "missing_breakdown": missing_breakdown,
        "outliers_breakdown": outliers_breakdown
    }
