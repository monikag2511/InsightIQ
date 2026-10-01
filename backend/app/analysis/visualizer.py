import pandas as pd
import numpy as np
from typing import List, Dict, Any
from backend.app.analysis.profiler import infer_column_type

def generate_visualizations(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Intelligently inspects column types and correlations to generate
    meaningful, non-redundant visualization payloads for the frontend.
    """
    charts = []

    # Classify columns
    col_types = {col: infer_column_type(df[col]) for col in df.columns}
    numeric_cols = [c for c, t in col_types.items() if t == "numerical"]
    cat_cols = [c for c, t in col_types.items() if t == "categorical"]
    date_cols = [c for c, t in col_types.items() if t == "datetime"]

    # If no explicit datetime column, check if any column contains dates
    if not date_cols:
        for c in df.columns:
            if "date" in c.lower() or "time" in c.lower() or "year" in c.lower():
                date_cols.append(c)
                break

    chart_counter = 1

    # 1. Rule: Date + Numerical -> Line Chart (Time series trend)
    if date_cols and numeric_cols:
        date_col = date_cols[0]
        # Choose primary numerical column (e.g. Sales or Revenue or first numeric)
        target_num = next((c for c in numeric_cols if any(k in c.lower() for k in ["sales", "revenue", "amount", "profit"])), numeric_cols[0])
        
        try:
            temp_df = df[[date_col, target_num]].dropna().copy()
            temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors='coerce')
            temp_df = temp_df.dropna()
            # Resample by month if span > 60 days, otherwise by date
            temp_df.sort_values(by=date_col, inplace=True)
            temp_df['period'] = temp_df[date_col].dt.to_period('M').astype(str)
            grouped = temp_df.groupby('period')[target_num].sum().reset_index()

            line_data = [{"period": str(row['period']), target_num: round(float(row[target_num]), 2)} for _, row in grouped.iterrows()]
            if len(line_data) >= 2:
                charts.append({
                    "id": f"chart-{chart_counter}",
                    "title": f"{target_num} Trend Over Time",
                    "chart_type": "line",
                    "x_axis": "period",
                    "y_axis": target_num,
                    "description": f"Monthly aggregate of {target_num} showcasing temporal trajectory and seasonal velocity.",
                    "data": line_data
                })
                chart_counter += 1
        except Exception:
            pass

    # 2. Rule: Categorical + Numerical -> Bar Chart
    if cat_cols and numeric_cols:
        primary_cat = next((c for c in cat_cols if any(k in c.lower() for k in ["category", "region", "segment", "department", "type"])), cat_cols[0])
        primary_num = next((c for c in numeric_cols if any(k in c.lower() for k in ["sales", "revenue", "profit", "amount"])), numeric_cols[0])

        try:
            temp_df = df[[primary_cat, primary_num]].dropna().copy()
            grouped = temp_df.groupby(primary_cat)[primary_num].sum().reset_index()
            grouped = grouped.sort_values(by=primary_num, ascending=False).head(10)

            bar_data = [{"category": str(row[primary_cat]), primary_num: round(float(row[primary_num]), 2)} for _, row in grouped.iterrows()]
            if bar_data:
                charts.append({
                    "id": f"chart-{chart_counter}",
                    "title": f"Total {primary_num} by {primary_cat}",
                    "chart_type": "bar",
                    "x_axis": "category",
                    "y_axis": primary_num,
                    "description": f"Performance breakdown across top {primary_cat} segments sorted by total {primary_num}.",
                    "data": bar_data
                })
                chart_counter += 1
        except Exception:
            pass

    # 3. Rule: Single Categorical -> Donut / Pie Chart (Composition)
    if cat_cols:
        # Pick secondary categorical or primary
        cat_for_donut = next((c for c in cat_cols if 2 <= df[c].nunique() <= 7), cat_cols[0])
        try:
            val_counts = df[cat_for_donut].dropna().value_counts().head(6)
            total = val_counts.sum()
            donut_data = [
                {"name": str(cat), "value": int(cnt), "percentage": round((cnt / total) * 100, 1)}
                for cat, cnt in val_counts.items()
            ]
            if len(donut_data) >= 2:
                charts.append({
                    "id": f"chart-{chart_counter}",
                    "title": f"Distribution by {cat_for_donut}",
                    "chart_type": "donut",
                    "x_axis": "name",
                    "y_axis": "value",
                    "description": f"Relative share and proportion of records belonging to each {cat_for_donut}.",
                    "data": donut_data
                })
                chart_counter += 1
        except Exception:
            pass

    # 4. Rule: Two Numerical Columns -> Scatter Plot
    if len(numeric_cols) >= 2:
        num1 = numeric_cols[0]
        num2 = numeric_cols[1]
        # Prefer Sales and Profit or Price and Quantity
        pairs = [("Sales", "Profit"), ("Quantity", "Sales"), ("Unit_Price", "Sales")]
        for p1, p2 in pairs:
            m1 = next((c for c in numeric_cols if p1.lower() in c.lower()), None)
            m2 = next((c for c in numeric_cols if p2.lower() in c.lower()), None)
            if m1 and m2 and m1 != m2:
                num1, num2 = m1, m2
                break

        try:
            scatter_df = df[[num1, num2]].dropna().copy()
            # Sample up to 100 points for crisp frontend rendering
            if len(scatter_df) > 100:
                scatter_df = scatter_df.sample(100, random_state=42)

            scatter_data = [
                {
                    "x": round(float(row[num1]), 2),
                    "y": round(float(row[num2]), 2),
                    "tooltip": f"{num1}: {round(float(row[num1]), 2)}, {num2}: {round(float(row[num2]), 2)}"
                }
                for _, row in scatter_df.iterrows()
            ]

            if scatter_data:
                charts.append({
                    "id": f"chart-{chart_counter}",
                    "title": f"{num2} vs. {num1} Correlation",
                    "chart_type": "scatter",
                    "x_axis": num1,
                    "y_axis": num2,
                    "description": f"Scatter distribution evaluating dispersion, outliers, and linear dependency between {num1} and {num2}.",
                    "data": scatter_data
                })
                chart_counter += 1
        except Exception:
            pass

    # 5. Rule: Numerical Distribution -> Histogram (Binned)
    if numeric_cols:
        target_hist = next((c for c in numeric_cols if any(k in c.lower() for k in ["sales", "profit", "price", "amount"])), numeric_cols[0])
        try:
            clean_s = pd.to_numeric(df[target_hist], errors='coerce').dropna()
            if not clean_s.empty:
                counts, bin_edges = np.histogram(clean_s, bins=10)
                hist_data = []
                for i in range(len(counts)):
                    bin_label = f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}"
                    hist_data.append({
                        "bin": bin_label,
                        "frequency": int(counts[i])
                    })
                charts.append({
                    "id": f"chart-{chart_counter}",
                    "title": f"{target_hist} Frequency Distribution",
                    "chart_type": "histogram",
                    "x_axis": "bin",
                    "y_axis": "frequency",
                    "description": f"Binned frequency histogram demonstrating skewness and concentration of {target_hist}.",
                    "data": hist_data
                })
                chart_counter += 1
        except Exception:
            pass

    # 6. Rule: Heatmap for Correlation Matrix
    if len(numeric_cols) >= 3:
        try:
            corr_df = df[numeric_cols[:6]].apply(pd.to_numeric, errors='coerce').corr()
            heatmap_data = []
            for col_x in corr_df.columns:
                for col_y in corr_df.index:
                    val = corr_df.loc[col_y, col_x]
                    heatmap_data.append({
                        "x": col_x,
                        "y": col_y,
                        "value": round(float(val), 2) if not np.isnan(val) else 0.0
                    })
            if heatmap_data:
                charts.append({
                    "id": f"chart-{chart_counter}",
                    "title": "Numerical Correlation Heatmap",
                    "chart_type": "heatmap",
                    "x_axis": "Feature X",
                    "y_axis": "Feature Y",
                    "description": "Pearson correlation coefficient grid assessing linear interdependencies.",
                    "data": heatmap_data
                })
                chart_counter += 1
        except Exception:
            pass

    return charts
