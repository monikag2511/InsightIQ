import re
import difflib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, Tuple, List
from backend.app.analysis.profiler import infer_column_type

def match_column(query: str, columns: List[str], preferred_type: Optional[str] = None, df: Optional[pd.DataFrame] = None) -> Optional[str]:
    """
    Fuzzy matches words in user question against actual column names.
    Supports synonyms (e.g. revenue -> Sales, client -> Customer_Name, cost/price -> Unit_Price).
    """
    synonyms = {
        "revenue": ["sales", "revenue", "amount", "total", "turnover"],
        "sales": ["sales", "revenue", "amount", "turnover"],
        "profit": ["profit", "margin", "income", "net"],
        "customer": ["customer", "client", "customer_name", "user", "buyer", "name"],
        "client": ["customer", "client", "customer_name"],
        "product": ["product", "item", "product_name", "goods"],
        "category": ["category", "segment", "type", "department"],
        "region": ["region", "area", "zone", "territory", "location", "state", "city", "country"],
        "quantity": ["quantity", "qty", "volume", "units", "count"],
        "price": ["unit_price", "price", "rate", "cost"],
        "date": ["order_date", "date", "created_at", "timestamp", "time", "day", "month", "year"],
        "month": ["order_date", "date", "created_at", "month"]
    }

    q_lower = query.lower()

    # 1. Direct exact or substring match in column names
    for col in columns:
        c_clean = col.lower().replace("_", " ").strip()
        if c_clean in q_lower or col.lower() in q_lower:
            return col

    # 2. Check synonyms
    for term, syn_list in synonyms.items():
        if term in q_lower:
            for s in syn_list:
                for col in columns:
                    if s in col.lower():
                        return col

    # 3. Fuzzy match individual query tokens
    tokens = re.findall(r'\b\w+\b', q_lower)
    for token in tokens:
        matches = difflib.get_close_matches(token, [c.lower() for c in columns], n=1, cutoff=0.7)
        if matches:
            matched_clean = matches[0]
            for col in columns:
                if col.lower() == matched_clean:
                    return col

    # 4. Fallback based on preferred type
    if preferred_type and df is not None:
        for col in columns:
            t = infer_column_type(df[col])
            if t == preferred_type:
                return col

    return None

def execute_natural_query(query: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Controlled Natural Language Analysis Engine.
    Interprets intent via deterministic NLP/regex rules, performs safe Pandas operations,
    and returns rich response objects (KPI, Table, Chart, or Text).
    """
    q = query.strip().lower()
    columns = list(df.columns)
    col_types = {col: infer_column_type(df[col]) for col in columns}
    numeric_cols = [c for c, t in col_types.items() if t == "numerical"]
    cat_cols = [c for c, t in col_types.items() if t in ["categorical", "text"]]
    date_cols = [c for c, t in col_types.items() if t == "datetime"]

    # 1. Dataset Summary Query
    if any(k in q for k in ["summarize", "summary", "overview", "describe", "tell me about"]):
        total_rows = len(df)
        total_cols = len(columns)
        missing_count = int(df.isna().sum().sum())
        dups = int(df.duplicated().sum())

        num_summary = []
        for nc in numeric_cols[:3]:
            num_summary.append(f"average {nc} is {df[nc].mean():,.2f}")
        num_str = f" Highlights: {', '.join(num_summary)}." if num_summary else ""

        answer = (
            f"The dataset contains {total_rows:,} rows across {total_cols} columns ({len(numeric_cols)} numerical, "
            f"{len(cat_cols)} categorical). It has {missing_count:,} missing values and {dups:,} duplicate rows.{num_str}"
        )

        return {
            "answer": answer,
            "response_type": "mixed",
            "kpi": {
                "label": "Total Dataset Records",
                "value": f"{total_rows:,}",
                "subtitle": f"{total_cols} Columns Profiling Complete"
            },
            "table": {
                "columns": ["Metric", "Value"],
                "rows": [
                    {"Metric": "Total Rows", "Value": f"{total_rows:,}"},
                    {"Metric": "Total Columns", "Value": f"{total_cols}"},
                    {"Metric": "Numerical Columns", "Value": f"{len(numeric_cols)}"},
                    {"Metric": "Categorical Columns", "Value": f"{len(cat_cols)}"},
                    {"Metric": "Missing Cells", "Value": f"{missing_count:,}"},
                    {"Metric": "Duplicate Rows", "Value": f"{dups:,}"}
                ],
                "total_records": 6
            },
            "chart": None,
            "executed_intent": "dataset_summary"
        }

    # 2. Missing Values or Data Quality Query
    if any(k in q for k in ["missing", "null", "clean", "quality", "duplicate", "empty"]):
        missing_cnt = int(df.isna().sum().sum())
        dups = int(df.duplicated().sum())
        total_cells = len(df) * len(columns)
        missing_pct = round((missing_cnt / total_cells) * 100, 2)

        breakdown_rows = []
        for col in columns:
            c_null = int(df[col].isna().sum())
            if c_null > 0:
                breakdown_rows.append({
                    "Column": col,
                    "Missing Count": c_null,
                    "Missing %": f"{round((c_null/len(df))*100, 2)}%"
                })

        answer = f"The dataset has {missing_cnt:,} missing values ({missing_pct}% of total cells) and {dups:,} duplicate rows."

        return {
            "answer": answer,
            "response_type": "table" if breakdown_rows else "kpi",
            "kpi": {
                "label": "Missing Values Count",
                "value": f"{missing_cnt:,}",
                "subtitle": f"{dups:,} duplicates detected"
            },
            "table": {
                "columns": ["Column", "Missing Count", "Missing %"],
                "rows": breakdown_rows if breakdown_rows else [{"Column": "All Columns", "Missing Count": 0, "Missing %": "0.0%"}],
                "total_records": len(breakdown_rows) if breakdown_rows else 1
            },
            "chart": None,
            "executed_intent": "data_quality_audit"
        }

    # 3. Correlations Query
    if any(k in q for k in ["correlation", "correlated", "relationship between"]):
        if len(numeric_cols) >= 2:
            num_df = df[numeric_cols].apply(pd.to_numeric, errors='coerce')
            corr = num_df.corr()
            abs_corr = corr.abs()
            np.fill_diagonal(abs_corr.values, 0)
            
            pairs = []
            for i in abs_corr.index:
                for j in abs_corr.columns:
                    if i < j: # Avoid duplicate pairs
                        score = corr.loc[i, j]
                        if not np.isnan(score):
                            pairs.append({"Metric A": i, "Metric B": j, "Correlation (r)": round(float(score), 3), "Strength": "Strong" if abs(score) > 0.6 else "Moderate" if abs(score) > 0.3 else "Weak"})
            pairs.sort(key=lambda x: abs(x["Correlation (r)"]), reverse=True)

            top_pair = pairs[0] if pairs else None
            ans = f"Computed Pearson correlation across all numerical features. The strongest relationship observed is between '{top_pair['Metric A']}' and '{top_pair['Metric B']}' with r = {top_pair['Correlation (r)']}." if top_pair else "No significant correlations found."

            return {
                "answer": ans,
                "response_type": "table",
                "table": {
                    "columns": ["Metric A", "Metric B", "Correlation (r)", "Strength"],
                    "rows": pairs[:10],
                    "total_records": len(pairs)
                },
                "kpi": {
                    "label": f"Strongest Correlation",
                    "value": f"r = {top_pair['Correlation (r)']}" if top_pair else "N/A",
                    "subtitle": f"{top_pair['Metric A']} & {top_pair['Metric B']}" if top_pair else ""
                } if top_pair else None,
                "chart": None,
                "executed_intent": "correlation_analysis"
            }

    # 4. Outliers Query
    if any(k in q for k in ["outlier", "anomaly", "extreme value"]):
        outlier_rows = []
        for c in numeric_cols:
            s = pd.to_numeric(df[c], errors='coerce').dropna()
            if len(s) > 10:
                q25, q75 = s.quantile(0.25), s.quantile(0.75)
                iqr = q75 - q25
                lb, ub = q25 - 1.5 * iqr, q75 + 1.5 * iqr
                outliers = s[(s < lb) | (s > ub)]
                if len(outliers) > 0:
                    outlier_rows.append({
                        "Column": c,
                        "Outlier Count": len(outliers),
                        "Percentage": f"{round(len(outliers)/len(s)*100, 2)}%",
                        "Lower Bound": round(lb, 2),
                        "Upper Bound": round(ub, 2),
                        "Min Value": round(s.min(), 2),
                        "Max Value": round(s.max(), 2)
                    })
        outlier_rows.sort(key=lambda x: x["Outlier Count"], reverse=True)
        total_outliers = sum(x["Outlier Count"] for x in outlier_rows)

        return {
            "answer": f"Outlier audit identified {total_outliers:,} potential anomalies across {len(outlier_rows)} numerical columns using IQR bounds.",
            "response_type": "table",
            "kpi": {
                "label": "Total Detected Outliers",
                "value": f"{total_outliers:,}",
                "subtitle": f"Across {len(outlier_rows)} columns"
            },
            "table": {
                "columns": ["Column", "Outlier Count", "Percentage", "Lower Bound", "Upper Bound", "Min Value", "Max Value"],
                "rows": outlier_rows,
                "total_records": len(outlier_rows)
            },
            "chart": None,
            "executed_intent": "outlier_analysis"
        }

    # 5. Temporal / Monthly Query: "Which month had the highest sales?" or "Sales trend"
    if any(k in q for k in ["month", "monthly", "year", "trend", "over time"]) and (date_cols or any("date" in c.lower() for c in columns)):
        d_col = date_cols[0] if date_cols else next(c for c in columns if "date" in c.lower())
        n_col = match_column(q, numeric_cols, preferred_type="numerical", df=df) or numeric_cols[0]

        try:
            t_df = df[[d_col, n_col]].dropna().copy()
            t_df[d_col] = pd.to_datetime(t_df[d_col], errors='coerce')
            t_df = t_df.dropna()
            t_df['month'] = t_df[d_col].dt.strftime('%B %Y')
            t_df['period'] = t_df[d_col].dt.to_period('M').astype(str)

            monthly = t_df.groupby(['period', 'month'])[n_col].sum().reset_index()
            monthly.sort_values(by='period', inplace=True)

            top_month_row = monthly.sort_values(by=n_col, ascending=False).iloc[0]
            best_month = top_month_row['month']
            best_val = top_month_row[n_col]

            chart_data = [{"period": r['period'], "month": r['month'], n_col: round(float(r[n_col]), 2)} for _, r in monthly.iterrows()]

            return {
                "answer": f"The month with the highest aggregate {n_col} was **{best_month}** generating **${best_val:,.2f}**.",
                "response_type": "mixed",
                "kpi": {
                    "label": f"Top Month ({n_col})",
                    "value": f"${best_val:,.2f}",
                    "subtitle": str(best_month)
                },
                "chart": {
                    "chart_type": "line",
                    "title": f"Monthly {n_col} Trajectory",
                    "x_key": "period",
                    "y_keys": [n_col],
                    "data": chart_data
                },
                "table": {
                    "columns": ["Month", n_col],
                    "rows": [{"Month": r['month'], n_col: f"${r[n_col]:,.2f}"} for _, r in monthly.sort_values(by=n_col, ascending=False).head(10).iterrows()],
                    "total_records": len(monthly)
                },
                "executed_intent": "temporal_monthly_aggregation"
            }
        except Exception:
            pass

    # 6. Groupby Query: "Which category has the highest sales?" / "Sales by region" / "Which region is performing best?"
    group_indicators = ["by", "highest", "lowest", "best", "worst", "performing", "distribution"]
    if any(k in q for k in group_indicators) and cat_cols:
        target_cat = match_column(q, cat_cols, preferred_type="categorical", df=df) or cat_cols[0]
        target_num = match_column(q, numeric_cols, preferred_type="numerical", df=df) or (numeric_cols[0] if numeric_cols else None)

        if target_num:
            is_min = any(k in q for k in ["lowest", "worst", "minimum", "bottom"])
            grouped = df.groupby(target_cat)[target_num].sum().reset_index()
            grouped.sort_values(by=target_num, ascending=is_min, inplace=True)

            top_row = grouped.iloc[0]
            top_entity = str(top_row[target_cat])
            top_val = float(top_row[target_num])
            total_sum = float(grouped[target_num].sum())
            top_share = round((top_val / total_sum) * 100, 1) if total_sum > 0 else 0

            descriptor = "lowest" if is_min else "highest"
            chart_data = [{"name": str(r[target_cat]), target_num: round(float(r[target_num]), 2)} for _, r in grouped.head(10).iterrows()]

            return {
                "answer": f"**{top_entity}** recorded the {descriptor} total {target_num} with **${top_val:,.2f}** ({top_share}% of all {target_num}).",
                "response_type": "mixed",
                "kpi": {
                    "label": f"{descriptor.capitalize()} {target_num} by {target_cat}",
                    "value": f"${top_val:,.2f}",
                    "subtitle": f"{top_entity} ({top_share}% share)"
                },
                "chart": {
                    "chart_type": "bar",
                    "title": f"Total {target_num} by {target_cat}",
                    "x_key": "name",
                    "y_keys": [target_num],
                    "data": chart_data
                },
                "table": {
                    "columns": [target_cat, target_num, "Share %"],
                    "rows": [
                        {target_cat: str(r[target_cat]), target_num: f"${r[target_num]:,.2f}", "Share %": f"{round((r[target_num]/total_sum)*100, 1)}%"}
                        for _, r in grouped.iterrows()
                    ],
                    "total_records": len(grouped)
                },
                "executed_intent": "categorical_aggregation"
            }

    # 7. Top-N Query: "Show me the top 10 customers" / "Top 5 products"
    top_match = re.search(r'\b(top|bottom)\s+(\d+)\b', q)
    if top_match:
        direction = top_match.group(1)
        n = min(50, int(top_match.group(2)))
        is_ascending = (direction == "bottom")

        target_cat = match_column(q, cat_cols, preferred_type="categorical", df=df) or cat_cols[0]
        target_num = match_column(q, numeric_cols, preferred_type="numerical", df=df) or (numeric_cols[0] if numeric_cols else None)

        if target_num:
            grouped = df.groupby(target_cat)[target_num].sum().reset_index()
            grouped.sort_values(by=target_num, ascending=is_ascending, inplace=True)
            top_records = grouped.head(n)

            chart_data = [{"name": str(r[target_cat]), target_num: round(float(r[target_num]), 2)} for _, r in top_records.iterrows()]

            table_rows = [
                {"Rank": idx + 1, target_cat: str(r[target_cat]), target_num: f"${r[target_num]:,.2f}"}
                for idx, (_, r) in enumerate(top_records.iterrows())
            ]

            return {
                "answer": f"Here are the {direction} {n} {target_cat} entities ranked by total {target_num}.",
                "response_type": "mixed",
                "kpi": {
                    "label": f"#1 {target_cat}",
                    "value": str(top_records.iloc[0][target_cat]),
                    "subtitle": f"${top_records.iloc[0][target_num]:,.2f} {target_num}"
                },
                "table": {
                    "columns": ["Rank", target_cat, target_num],
                    "rows": table_rows,
                    "total_records": len(table_rows)
                },
                "chart": {
                    "chart_type": "bar",
                    "title": f"{direction.capitalize()} {n} {target_cat} by {target_num}",
                    "x_key": "name",
                    "y_keys": [target_num],
                    "data": chart_data
                },
                "executed_intent": "top_n_ranking"
            }

    # 8. Single Numerical Aggregation: Average, Sum, Min, Max, Count
    # "What is the average revenue?" / "Total profit" / "Maximum sales"
    agg_op = None
    if any(k in q for k in ["average", "avg", "mean"]):
        agg_op = "mean"
    elif any(k in q for k in ["sum", "total"]):
        agg_op = "sum"
    elif any(k in q for k in ["maximum", "max", "highest", "peak"]):
        agg_op = "max"
    elif any(k in q for k in ["minimum", "min", "lowest"]):
        agg_op = "min"
    elif any(k in q for k in ["count", "how many"]):
        agg_op = "count"

    if agg_op and numeric_cols:
        target_num = match_column(q, numeric_cols, preferred_type="numerical", df=df) or numeric_cols[0]
        s = pd.to_numeric(df[target_num], errors='coerce').dropna()

        if agg_op == "mean":
            val = float(s.mean())
            op_label = "Average"
        elif agg_op == "sum":
            val = float(s.sum())
            op_label = "Total"
        elif agg_op == "max":
            val = float(s.max())
            op_label = "Maximum"
        elif agg_op == "min":
            val = float(s.min())
            op_label = "Minimum"
        else:
            val = float(len(s))
            op_label = "Count"

        return {
            "answer": f"The calculated {op_label.lower()} for **{target_num}** across all records is **${val:,.2f}** (or {val:,.2f}).",
            "response_type": "kpi",
            "kpi": {
                "label": f"{op_label} {target_num}",
                "value": f"${val:,.2f}" if any(k in target_num.lower() for k in ["sales", "profit", "price", "revenue", "cost"]) else f"{val:,.2f}",
                "subtitle": f"Computed across {len(s):,} entries"
            },
            "table": None,
            "chart": None,
            "executed_intent": f"single_aggregation_{agg_op}"
        }

    # 9. Filter Query: "Show customers with revenue above 50000" or "sales > 1000"
    num_filter_match = re.search(r'([><=]+|\babove\b|\bover\b|\bgreater than\b|\bbelow\b|\bless than\b)\s*(\$?\s*[\d,]+(\.\d+)?)', q)
    if num_filter_match and numeric_cols:
        cond_raw = num_filter_match.group(1).strip()
        val_raw = float(re.sub(r'[^\d.]', '', num_filter_match.group(2)))
        target_num = match_column(q, numeric_cols, preferred_type="numerical", df=df) or numeric_cols[0]

        is_gt = any(k in cond_raw for k in [">", "above", "over", "greater"])
        if is_gt:
            filtered = df[df[target_num] > val_raw]
            comp_str = f"greater than {val_raw:,.2f}"
        else:
            filtered = df[df[target_num] < val_raw]
            comp_str = f"less than {val_raw:,.2f}"

        cnt = len(filtered)
        pct = round(cnt / len(df) * 100, 1)

        display_cols = [c for c in columns if c in [target_num] or infer_column_type(df[c]) in ["categorical", "text"]][:5]
        if target_num not in display_cols:
            display_cols.append(target_num)

        preview_rows = filtered[display_cols].head(15).to_dict(orient="records")

        return {
            "answer": f"Found **{cnt:,}** records ({pct}% of dataset) where **{target_num}** is {comp_str}.",
            "response_type": "mixed",
            "kpi": {
                "label": f"Filtered Records ({target_num} {comp_str})",
                "value": f"{cnt:,}",
                "subtitle": f"{pct}% of entire dataset"
            },
            "table": {
                "columns": display_cols,
                "rows": preview_rows,
                "total_records": cnt
            },
            "chart": None,
            "executed_intent": "numerical_filtering"
        }

    # 10. Fallback General Descriptive Response
    # Pick a sensible default summary
    primary_num = numeric_cols[0] if numeric_cols else columns[0]
    total_recs = len(df)
    mean_val = float(df[primary_num].mean()) if primary_num in numeric_cols else 0.0

    return {
        "answer": f"Analyzed your question against the dataset. Found {total_recs:,} records. For {primary_num}, the mean is {mean_val:,.2f}.",
        "response_type": "kpi",
        "kpi": {
            "label": f"Average {primary_num}",
            "value": f"{mean_val:,.2f}",
            "subtitle": f"Across {total_recs:,} entries"
        },
        "table": None,
        "chart": None,
        "executed_intent": "general_overview"
    }
