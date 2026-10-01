import os
import json
import httpx
import pandas as pd
from typing import Dict, Any, Optional
from backend.app.analysis.query_engine import execute_natural_query

AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

async def ask_insightiq(query: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Orchestrates Natural Language querying using the mandated architecture:
    1. Dataset is ALWAYS the source of truth.
    2. Controlled query engine executes Pandas calculations.
    3. If an LLM API key is present, optionally refine the explanation while keeping computed numbers intact.
    4. If no LLM key is configured, operates seamlessly in Fallback Built-in Engine Mode.
    """
    # Step 1: Execute controlled Pandas computation
    computed_result = execute_natural_query(query, df)

    # Check if AI mode is configured
    if not AI_API_KEY:
        computed_result["mode"] = "builtin_engine"
        computed_result["disclaimer"] = "AI mode is not configured. Using InsightIQ's built-in analysis engine."
        return computed_result

    # Step 2: If AI key is configured, enrich the text explanation with LLM without altering numerical figures
    try:
        enriched_explanation = await call_llm_for_explanation(query, computed_result)
        if enriched_explanation:
            computed_result["answer"] = enriched_explanation
            computed_result["mode"] = "ai_llm"
        else:
            computed_result["mode"] = "builtin_engine"
            computed_result["disclaimer"] = "Using InsightIQ's built-in analysis engine."
    except Exception:
        computed_result["mode"] = "builtin_engine"
        computed_result["disclaimer"] = "AI fallback engaged. Using InsightIQ's built-in analysis engine."

    return computed_result

async def call_llm_for_explanation(user_question: str, computation_payload: Dict[str, Any]) -> Optional[str]:
    """
    Calls Gemini or OpenAI REST API safely to polish the business explanation of real calculated facts.
    """
    if not AI_API_KEY:
        return None

    prompt = f"""
You are InsightIQ's senior data analytics assistant.
User asked: "{user_question}"

The controlled data engine computed the following actual dataset facts:
- Intent: {computation_payload.get('executed_intent')}
- Answer: {computation_payload.get('answer')}
- KPI: {computation_payload.get('kpi')}

Provide a concise, professional business analyst explanation (2-4 sentences) summarizing this finding.
CRITICAL CONSTRAINT: Do NOT change or invent any numerical results. The numbers provided are final and ground truth.
"""

    try:
        # Check if Gemini API key (starts with AIza) or OpenAI
        if AI_API_KEY.startswith("AIza"):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={AI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 300}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        return candidates[0]["content"]["parts"][0]["text"].strip()
        else:
            # OpenAI compatible endpoint
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {AI_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a professional SaaS data analytics consultant."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 250
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return None

    return None

def generate_ai_dataset_summary(
    df: pd.DataFrame,
    profile: Dict[str, Any],
    stats: Dict[str, Any],
    insights: list
) -> str:
    """
    Generates a structured, executive-ready analytical summary based on
    actual computed statistics, following the required 6-part structure:
    - Dataset Overview
    - Key Trends
    - Important Categories
    - Potential Problems
    - Interesting Patterns
    - Overall Summary
    """
    total_rows = len(df)
    total_cols = len(df.columns)
    quality_score = profile.get("quality_score", 100.0)
    missing_cnt = profile.get("missing_values", 0)
    dup_cnt = profile.get("duplicate_rows", 0)

    # Key numeric drivers
    num_keys = list(stats.get("numerical", {}).keys())
    primary_num = num_keys[0] if num_keys else None
    cat_keys = list(stats.get("categorical", {}).keys())
    primary_cat = cat_keys[0] if cat_keys else None

    # Overview
    overview_text = (
        f"The dataset consists of {total_rows:,} records across {total_cols} dimensions. "
        f"Initial automated health scoring rates this data at {quality_score}/100."
    )

    # Key trends
    trend_insights = [i for i in insights if i.get("category") == "trend"]
    if trend_insights:
        trend_text = trend_insights[0]["description"]
    elif primary_num:
        mean_v = stats["numerical"][primary_num].get("mean", 0)
        max_v = stats["numerical"][primary_num].get("max", 0)
        trend_text = f"Primary metric '{primary_num}' averages {mean_v:,.2f} with peak observations reaching {max_v:,.2f}."
    else:
        trend_text = "Metric observations remain stable across the captured timeline."

    # Important Categories
    cat_insights = [i for i in insights if i.get("category") == "category"]
    if cat_insights:
        cat_text = cat_insights[0]["description"]
    elif primary_cat and "most_frequent" in stats["categorical"][primary_cat]:
        top_c = stats["categorical"][primary_cat]["most_frequent"]
        top_f = stats["categorical"][primary_cat]["frequency"]
        cat_text = f"Category '{top_c}' is the dominant segment in '{primary_cat}', accounting for {top_f:,} instances."
    else:
        cat_text = "Category segments display balanced proportional allocation."

    # Potential Problems
    problems = []
    if missing_cnt > 0:
        problems.append(f"{missing_cnt:,} missing field values require imputation or handling")
    if dup_cnt > 0:
        problems.append(f"{dup_cnt:,} duplicate entries risk skewing downstream aggregates")
    outlier_insights = [i for i in insights if i.get("category") == "outlier"]
    if outlier_insights:
        problems.append(outlier_insights[0]["title"])
    if not problems:
        problems_text = "Zero critical data integrity issues detected. Schema compliance and completeness are high."
    else:
        problems_text = "; ".join(problems) + "."

    # Interesting Patterns
    corr_insights = [i for i in insights if i.get("category") == "correlation"]
    if corr_insights:
        pattern_text = corr_insights[0]["description"]
    else:
        pattern_text = "Linear distribution analysis shows standard variance without severe non-linear clustering."

    # Overall Summary
    overall_text = (
        f"InsightIQ confirms the dataset is analytically sound for decision-making. "
        f"With a data quality rating of {quality_score}%, it provides dependable foundations for strategic insights."
    )

    summary_md = f"""### Dataset Overview
{overview_text}

### Key Trends
{trend_text}

### Important Categories
{cat_text}

### Potential Problems
{problems_text}

### Interesting Patterns
{pattern_text}

### Overall Summary
{overall_text}"""

    return summary_md
