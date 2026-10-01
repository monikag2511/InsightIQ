import pandas as pd
import numpy as np
from typing import Dict, Any

def compute_dataset_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes rigorous descriptive statistics for numerical & categorical columns,
    and calculates the Pearson correlation matrix for numerical features.
    """
    numerical_stats = {}
    categorical_stats = {}

    # 1. Numerical Statistics
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        series = pd.to_numeric(df[col], errors='coerce').dropna()
        if series.empty:
            continue

        q25 = float(series.quantile(0.25))
        q50 = float(series.median())
        q75 = float(series.quantile(0.75))
        iqr = q75 - q25

        mode_series = series.mode()
        mode_val = float(mode_series[0]) if not mode_series.empty else None

        min_val = float(series.min())
        max_val = float(series.max())
        std_val = float(series.std()) if len(series) > 1 else 0.0
        var_val = float(series.var()) if len(series) > 1 else 0.0

        numerical_stats[str(col)] = {
            "mean": round(float(series.mean()), 2),
            "median": round(q50, 2),
            "mode": round(mode_val, 2) if mode_val is not None else None,
            "min": round(min_val, 2),
            "max": round(max_val, 2),
            "range": round(max_val - min_val, 2),
            "std": round(std_val, 2),
            "variance": round(var_val, 2),
            "q25": round(q25, 2),
            "q50": round(q50, 2),
            "q75": round(q75, 2),
            "iqr": round(iqr, 2)
        }

    # 2. Categorical Statistics
    cat_cols = [c for c in df.columns if c not in numeric_cols]
    for col in cat_cols:
        series = df[col].dropna().astype(str)
        if series.empty:
            continue

        value_counts = series.value_counts()
        total_non_null = len(series)

        most_frequent = str(value_counts.index[0]) if not value_counts.empty else None
        top_freq = int(value_counts.iloc[0]) if not value_counts.empty else 0

        # Distribution of top 10 categories
        top_dist = []
        for cat_name, count in value_counts.head(10).items():
            top_dist.append({
                "category": str(cat_name),
                "count": int(count),
                "percentage": round((count / total_non_null) * 100.0, 2)
            })

        categorical_stats[str(col)] = {
            "unique_count": int(series.nunique()),
            "most_frequent": most_frequent,
            "frequency": top_freq,
            "distribution": top_dist
        }

    # 3. Correlation Matrix
    corr_matrix: Dict[str, Dict[str, Any]] = {}
    if len(numeric_cols) >= 2:
        num_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
        corr_df = num_df.corr(method="pearson")
        for r_col in corr_df.index:
            corr_matrix[str(r_col)] = {}
            for c_col in corr_df.columns:
                val = corr_df.loc[r_col, c_col]
                corr_matrix[str(r_col)][str(c_col)] = round(float(val), 3) if not np.isnan(val) else None

    return {
        "numerical": numerical_stats,
        "categorical": categorical_stats,
        "correlation_matrix": corr_matrix
    }
