import pandas as pd
import numpy as np
from typing import List, Dict, Any
from backend.app.analysis.profiler import infer_column_type

def generate_dataset_insights(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Analyzes actual computed statistical attributes of the dataset to produce
    ground-truth, highly relevant insights categorized into:
    category, trend, correlation, outlier, quality, and distribution.
    """
    insights = []
    insight_idx = 1

    total_rows = len(df)
    if total_rows == 0:
        return insights

    # 1. Quality & Completeness Insights
    total_missing = int(df.isna().sum().sum())
    total_cells = total_rows * len(df.columns)
    missing_pct = round((total_missing / total_cells) * 100, 2)
    if total_missing > 0:
        cols_with_missing = [c for c in df.columns if df[c].isna().sum() > 0]
        worst_col = max(cols_with_missing, key=lambda c: df[c].isna().sum())
        worst_cnt = int(df[worst_col].isna().sum())
        worst_pct = round((worst_cnt / total_rows) * 100, 1)

        insights.append({
            "id": f"ins-{insight_idx}",
            "category": "quality",
            "title": f"Data Integrity: {missing_pct}% Missing Values Detected",
            "description": f"A total of {total_missing:,} cells ({missing_pct}%) contain null values across {len(cols_with_missing)} columns. Column '{worst_col}' exhibited the highest null concentration with {worst_cnt:,} missing entries ({worst_pct}%).",
            "severity": "warning" if missing_pct > 2.0 else "info",
            "metric_highlight": f"{missing_pct}% null"
        })
        insight_idx += 1
    else:
        insights.append({
            "id": f"ins-{insight_idx}",
            "category": "quality",
            "title": "Pristine Data Completeness: 100% Zero Nulls",
            "description": "All columns and rows are completely populated with zero missing cells detected.",
            "severity": "success",
            "metric_highlight": "100% complete"
        })
        insight_idx += 1

    # 2. Duplicate Row Insight
    dups = int(df.duplicated().sum())
    if dups > 0:
        dup_pct = round((dups / total_rows) * 100, 1)
        insights.append({
            "id": f"ins-{insight_idx}",
            "category": "quality",
            "title": f"Duplicate Records Identified: {dups:,} Rows",
            "description": f"{dups:,} duplicate rows ({dup_pct}%) were discovered in the dataset. Deduplication is recommended before statistical modeling to prevent skew.",
            "severity": "warning",
            "metric_highlight": f"{dups} duplicates"
        })
        insight_idx += 1

    # Classify columns
    col_types = {col: infer_column_type(df[col]) for col in df.columns}
    numeric_cols = [c for c, t in col_types.items() if t == "numerical"]
    cat_cols = [c for c, t in col_types.items() if t == "categorical"]
    date_cols = [c for c, t in col_types.items() if t == "datetime"]

    # 3. Categorical Leadership Insights (Highest & lowest revenue / volume)
    if cat_cols and numeric_cols:
        target_num = next((c for c in numeric_cols if any(k in c.lower() for k in ["sales", "revenue", "profit", "amount"])), numeric_cols[0])
        target_cat = next((c for c in cat_cols if any(k in c.lower() for k in ["category", "segment", "region", "product"])), cat_cols[0])

        try:
            grouped = df.groupby(target_cat)[target_num].sum().sort_values(ascending=False)
            if len(grouped) >= 2:
                top_cat = grouped.index[0]
                top_val = grouped.iloc[0]
                bottom_cat = grouped.index[-1]
                bottom_val = grouped.iloc[-1]
                total_val = grouped.sum()
                top_share = round((top_val / total_val) * 100, 1) if total_val > 0 else 0

                insights.append({
                    "id": f"ins-{insight_idx}",
                    "category": "category",
                    "title": f"Dominant Leader: '{top_cat}' Leads {target_num}",
                    "description": f"'{top_cat}' generated the highest aggregate {target_num} with {top_val:,.2f} ({top_share}% of all {target_num}), outperforming '{bottom_cat}' by {round(top_val / max(1e-6, bottom_val), 1)}x.",
                    "severity": "success",
                    "metric_highlight": f"{top_share}% share"
                })
                insight_idx += 1
        except Exception:
            pass

    # 4. Temporal Trend Insight (Peak Month / Growth)
    if date_cols and numeric_cols:
        date_col = date_cols[0]
        target_num = next((c for c in numeric_cols if any(k in c.lower() for k in ["sales", "revenue", "profit", "amount"])), numeric_cols[0])
        try:
            t_df = df[[date_col, target_num]].dropna().copy()
            t_df[date_col] = pd.to_datetime(t_df[date_col], errors='coerce')
            t_df = t_df.dropna()
            t_df['month_name'] = t_df[date_col].dt.strftime('%B')
            monthly = t_df.groupby('month_name')[target_num].sum().sort_values(ascending=False)
            if not monthly.empty:
                best_month = monthly.index[0]
                best_sales = monthly.iloc[0]
                insights.append({
                    "id": f"ins-{insight_idx}",
                    "category": "trend",
                    "title": f"Seasonal Peak: {best_month} Recorded Highest Volume",
                    "description": f"Temporal aggregation reveals that {best_month} registered the highest cumulative {target_num} across the tracking period, reaching {best_sales:,.2f}.",
                    "severity": "info",
                    "metric_highlight": f"Peak in {best_month}"
                })
                insight_idx += 1
        except Exception:
            pass

    # 5. Correlation Insights (Pearson)
    if len(numeric_cols) >= 2:
        try:
            num_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
            corr = num_df.corr()
            
            best_pair = None
            max_abs_corr = 0.0

            for i in corr.index:
                for j in corr.columns:
                    if i < j:
                        score = corr.loc[i, j]
                        if not np.isnan(score) and abs(score) > max_abs_corr:
                            max_abs_corr = abs(score)
                            best_pair = (i, j, float(score))

            if best_pair and max_abs_corr > 0.4:
                c1, c2, raw_corr = best_pair
                raw_corr = round(raw_corr, 2)
                direction = "positive" if raw_corr > 0 else "negative"
                insights.append({
                    "id": f"ins-{insight_idx}",
                    "category": "correlation",
                    "title": f"Strong {direction.capitalize()} Correlation: {c1} & {c2}",
                    "description": f"Statistically significant {direction} correlation of r = {raw_corr} identified between '{c1}' and '{c2}'. Changes in one metric correspond directly with directional movements in the other.",
                    "severity": "info",
                    "metric_highlight": f"r = {raw_corr}"
                })
                insight_idx += 1
        except Exception:
            pass

    # 6. Outlier & Anomaly Insights
    if numeric_cols:
        for c in numeric_cols[:4]:
            s = pd.to_numeric(df[c], errors='coerce').dropna()
            if len(s) > 20:
                q25 = float(s.quantile(0.25))
                q75 = float(s.quantile(0.75))
                iqr = q75 - q25
                lb = q25 - 1.5 * iqr
                ub = q75 + 1.5 * iqr
                outliers = s[(s < lb) | (s > ub)]
                if len(outliers) > 0:
                    pct = round(len(outliers) / len(s) * 100, 1)
                    insights.append({
                        "id": f"ins-{insight_idx}",
                        "category": "outlier",
                        "title": f"Variance Anomaly: {len(outliers)} Outlier(s) in '{c}'",
                        "description": f"Found {len(outliers)} data point(s) ({pct}%) in '{c}' outside normal thresholds [{round(lb, 1)}, {round(ub, 1)}], reaching an apex of {round(float(s.max()), 2)}.",
                        "severity": "alert" if pct > 3.0 else "info",
                        "metric_highlight": f"{len(outliers)} outliers"
                    })
                    insight_idx += 1
                    break

    return insights
