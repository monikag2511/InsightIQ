import pandas as pd
import numpy as np
import re
from typing import List, Dict, Any, Tuple

def clean_column_names(df: pd.DataFrame) -> Tuple[pd.DataFrame, int]:
    """
    Normalizes column names by stripping spaces, removing special symbols,
    and converting to clean snake_case.
    """
    renamed_count = 0
    new_cols = {}
    for col in df.columns:
        clean = str(col).strip()
        clean = re.sub(r'[^\w\s-]', '', clean)
        clean = re.sub(r'[-\s]+', '_', clean)
        if clean != col:
            renamed_count += 1
        new_cols[col] = clean
    return df.rename(columns=new_cols), renamed_count

def apply_cleaning_pipeline(
    df: pd.DataFrame,
    operations: List[Dict[str, Any]] = None,
    auto_clean: bool = False
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Applies either automated comprehensive cleaning or user-specified operations.
    Returns (cleaned_df, list_of_changes).
    """
    cleaned_df = df.copy()
    changes = []

    if auto_clean or not operations:
        # Step 1: Remove completely empty columns
        empty_cols = [c for c in cleaned_df.columns if cleaned_df[c].isna().all()]
        if empty_cols:
            cleaned_df.drop(columns=empty_cols, inplace=True)
            changes.append(f"Dropped {len(empty_cols)} completely empty column(s): {', '.join(empty_cols)}")

        # Step 2: Remove duplicate rows
        dup_count = int(cleaned_df.duplicated().sum())
        if dup_count > 0:
            cleaned_df.drop_duplicates(inplace=True)
            changes.append(f"Removed {dup_count} duplicate row(s)")

        # Step 3: Normalize column names
        cleaned_df, renamed_count = clean_column_names(cleaned_df)
        if renamed_count > 0:
            changes.append(f"Normalized {renamed_count} column name(s) to clean snake_case format")

        # Step 4: Parse dates where applicable
        date_converted = 0
        for col in cleaned_df.columns:
            if cleaned_df[col].dtype == 'object':
                sample = cleaned_df[col].dropna().astype(str).head(30)
                if not sample.empty:
                    try:
                        parsed = pd.to_datetime(sample, errors='coerce', format='mixed')
                        if parsed.notna().sum() / len(sample) > 0.85:
                            cleaned_df[col] = pd.to_datetime(cleaned_df[col], errors='coerce', format='mixed')
                            date_converted += 1
                    except Exception:
                        pass
        if date_converted > 0:
            changes.append(f"Parsed {date_converted} column(s) into structured DateTime format")

        # Step 5: Handle missing values intelligently
        handled_missing_num = 0
        handled_missing_cat = 0
        for col in cleaned_df.columns:
            missing_count = int(cleaned_df[col].isna().sum())
            if missing_count > 0:
                if pd.api.types.is_numeric_dtype(cleaned_df[col]):
                    median_val = cleaned_df[col].median()
                    cleaned_df[col] = cleaned_df[col].fillna(median_val)
                    handled_missing_num += missing_count
                else:
                    mode_vals = cleaned_df[col].mode()
                    fill_val = mode_vals[0] if not mode_vals.empty else "Unknown"
                    cleaned_df[col] = cleaned_df[col].fillna(fill_val)
                    handled_missing_cat += missing_count

        if handled_missing_num > 0:
            changes.append(f"Imputed {handled_missing_num} missing numerical value(s) using median strategy")
        if handled_missing_cat > 0:
            changes.append(f"Imputed {handled_missing_cat} missing categorical/text value(s) using mode strategy")

        if not changes:
            changes.append("Dataset verified. No anomalies, duplicates, or missing values required remediation.")

        return cleaned_df, changes

    # User-driven targeted operations
    for op in operations:
        action = op.get("operation")
        col = op.get("column")
        strategy = op.get("strategy")
        fill_val = op.get("fill_value")

        if action == "remove_duplicates":
            dup_count = int(cleaned_df.duplicated().sum())
            cleaned_df.drop_duplicates(inplace=True)
            changes.append(f"Removed {dup_count} duplicate row(s)")

        elif action == "normalize_names":
            cleaned_df, renamed_count = clean_column_names(cleaned_df)
            changes.append(f"Normalized {renamed_count} column name(s)")

        elif action == "drop_empty_columns":
            empty_cols = [c for c in cleaned_df.columns if cleaned_df[c].isna().all()]
            if empty_cols:
                cleaned_df.drop(columns=empty_cols, inplace=True)
                changes.append(f"Dropped {len(empty_cols)} completely empty column(s)")

        elif action == "drop_missing_rows":
            if col and col in cleaned_df.columns:
                before = len(cleaned_df)
                cleaned_df.dropna(subset=[col], inplace=True)
                dropped = before - len(cleaned_df)
                changes.append(f"Dropped {dropped} row(s) containing missing values in '{col}'")
            else:
                before = len(cleaned_df)
                cleaned_df.dropna(inplace=True)
                dropped = before - len(cleaned_df)
                changes.append(f"Dropped {dropped} row(s) with missing values across entire dataset")

        elif action == "fill_missing":
            if col and col in cleaned_df.columns:
                missing_cnt = int(cleaned_df[col].isna().sum())
                if missing_cnt > 0:
                    if strategy == "mean" and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                        val = cleaned_df[col].mean()
                        cleaned_df[col] = cleaned_df[col].fillna(val)
                        changes.append(f"Filled {missing_cnt} missing value(s) in '{col}' with mean ({round(val, 2)})")
                    elif strategy == "median" and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                        val = cleaned_df[col].median()
                        cleaned_df[col] = cleaned_df[col].fillna(val)
                        changes.append(f"Filled {missing_cnt} missing value(s) in '{col}' with median ({round(val, 2)})")
                    elif strategy == "mode":
                        mode_s = cleaned_df[col].mode()
                        val = mode_s[0] if not mode_s.empty else "Unknown"
                        cleaned_df[col] = cleaned_df[col].fillna(val)
                        changes.append(f"Filled {missing_cnt} missing value(s) in '{col}' with mode ('{val}')")
                    elif strategy == "constant" and fill_val is not None:
                        cleaned_df[col] = cleaned_df[col].fillna(fill_val)
                        changes.append(f"Filled {missing_cnt} missing value(s) in '{col}' with constant '{fill_val}'")
                    else:
                        cleaned_df[col] = cleaned_df[col].fillna("Unknown")
                        changes.append(f"Filled {missing_cnt} missing value(s) in '{col}' with default placeholder")

        elif action == "remove_outliers":
            if col and col in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                q25 = float(cleaned_df[col].quantile(0.25))
                q75 = float(cleaned_df[col].quantile(0.75))
                iqr = q75 - q25
                lb = q25 - 1.5 * iqr
                ub = q75 + 1.5 * iqr
                before = len(cleaned_df)
                cleaned_df = cleaned_df[(cleaned_df[col] >= lb) & (cleaned_df[col] <= ub)]
                removed = before - len(cleaned_df)
                changes.append(f"Trimmed {removed} outlier row(s) from '{col}' (bounds [{round(lb, 1)}, {round(ub, 1)}])")

    return cleaned_df, changes
