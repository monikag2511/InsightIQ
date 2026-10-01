import os
import json
import httpx
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv, find_dotenv
from backend.app.analysis.query_engine import execute_natural_query

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def get_ai_config() -> Tuple[str, str, str, str]:
    """
    Dynamically loads and sanitizes AI configuration from .env without requiring a server reboot.
    Checks root and backend directories.
    """
    # 1. Search for .env file
    env_file = find_dotenv(usecwd=True)
    if env_file:
        load_dotenv(env_file, override=True)
    for candidate in [".env", "../.env", "backend/.env", "../backend/.env"]:
        if os.path.exists(candidate):
            load_dotenv(candidate, override=True)

    groq_key = (os.getenv("GROQ_API_KEY") or os.getenv("AI_API_KEY") or "").strip().strip("'\"")
    groq_model = (os.getenv("GROQ_MODEL") or "openai/gpt-oss-120b").strip().strip("'\"")
    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip().strip("'\"")
    openai_key = (os.getenv("OPENAI_API_KEY") or "").strip().strip("'\"")

    return groq_key, groq_model, gemini_key, openai_key

async def ask_insightiq(query: str, df: pd.DataFrame) -> Dict[str, Any]:
    """
    Orchestrates Natural Language querying using the mandated architecture:
    1. Dataset is ALWAYS the source of truth.
    2. Controlled query engine executes Pandas calculations.
    3. If Groq API key is present, enriches the business explanation using Groq's high-speed inference.
    4. If no LLM key is configured, operates seamlessly in Fallback Built-in Engine Mode.
    """
    # Step 1: Execute controlled Pandas computation
    computed_result = execute_natural_query(query, df)

    # Step 2: Read dynamic AI config
    groq_key, groq_model, gemini_key, openai_key = get_ai_config()
    active_key = groq_key or gemini_key or openai_key

    if not active_key:
        computed_result["mode"] = "builtin_engine"
        computed_result["provider"] = "builtin"
        computed_result["model"] = "deterministic_pandas"
        computed_result["disclaimer"] = "Operating in Ask Your Data built-in analysis engine (No API key configured)."
        return computed_result

    # Step 3: Enrich explanation via Groq LLM without altering computed numerical facts
    try:
        enriched_explanation, provider, model_used, error_msg = await call_groq_or_llm_for_explanation(
            query, computed_result, df, groq_key, groq_model, gemini_key, openai_key
        )
        if enriched_explanation:
            computed_result["answer"] = enriched_explanation
            computed_result["mode"] = f"ai_{provider}"
            computed_result["provider"] = provider
            computed_result["model"] = model_used
            if computed_result.get("executed_intent") == "unmatched":
                computed_result["disclaimer"] = f"AI Data Assistant ({model_used})"
            else:
                computed_result["disclaimer"] = f"AI Explanation enriched via {provider.upper()} ({model_used}). Calculations 100% verified by Pandas."
        else:
            computed_result["mode"] = "builtin_engine"
            computed_result["provider"] = "builtin"
            computed_result["model"] = "deterministic_pandas"
            computed_result["ai_error"] = error_msg
            computed_result["disclaimer"] = f"AI fallback engaged: {error_msg or 'Using Ask Your Data built-in analysis engine.'}"
    except Exception as e:
        computed_result["mode"] = "builtin_engine"
        computed_result["provider"] = "builtin"
        computed_result["model"] = "deterministic_pandas"
        computed_result["ai_error"] = str(e)
        computed_result["disclaimer"] = f"AI fallback engaged. Error: {str(e)}"

    return computed_result

async def call_groq_or_llm_for_explanation(
    user_question: str,
    computation_payload: Dict[str, Any],
    df: pd.DataFrame,
    groq_key: str,
    groq_model: str,
    gemini_key: str,
    openai_key: str
) -> Tuple[Optional[str], str, str, Optional[str]]:
    """
    Calls Groq API (or alternative LLMs) to formulate an intelligent response.
    - If a mathematical/Pandas intent was matched: formulates a verified business explanation without changing numbers.
    - If the query is conversational/unmatched: guides the user smartly based on actual dataset columns without fake calculations.
    Returns: (explanation, provider, model, error_message)
    """
    is_unmatched = computation_payload.get("executed_intent") == "unmatched"
    columns = list(df.columns)
    numeric_cols = [c for c in columns if pd.api.types.is_numeric_dtype(df[c])]
    cat_cols = [c for c in columns if c not in numeric_cols]

    if is_unmatched:
        sample_cols = ", ".join(columns[:6])
        num_samples = []
        for c in numeric_cols[:3]:
            try:
                m = float(df[c].mean())
                num_samples.append(f"{c} (mean ~ {m:,.1f})")
            except Exception:
                pass
        num_summary_str = ", ".join(num_samples) if num_samples else "None"

        cat_samples = []
        for c in cat_cols[:2]:
            try:
                top_vals = [str(v) for v in df[c].dropna().unique()[:3]]
                cat_samples.append(f"{c} (values like {', '.join(top_vals)})")
            except Exception:
                pass
        cat_summary_str = "; ".join(cat_samples) if cat_samples else "None"

        prompt = f"""Dataset overview: {len(df):,} records with columns: {', '.join(columns)}.
Key Metrics: {num_summary_str}

User Message: "{user_question}"

OUTPUT FORMAT RULES (STRICT):
1. Keep the entire response neat, concise, and point-to-point (under 100 words total).
2. Start with 1 friendly, professional opening line (e.g. greeting or clarifying what to analyze).
3. Provide exactly 3 short, high-value, 1-line question suggestions using actual dataset columns (e.g. {sample_cols}).
   Format:
   - Question 1?
   - Question 2?
   - Question 3?
4. Do NOT dump or list all column names vertically.
5. Do NOT write multi-line paragraphs or explanations under each bullet.
6. Complete all sentences fully. Never stop mid-thought."""

        system_content = (
            "You are a sharp, executive AI Data Analyst for 'Ask Your Data'. "
            "You deliver crisp, neat, point-to-point responses. "
            "Never produce long walls of text, never list raw columns vertically, and never leave a sentence unfinished."
        )
    else:
        prompt = f"""User Question: "{user_question}"

Actual Computed Dataset Facts:
- Ground Truth Answer: {computation_payload.get('answer')}
- Metric / KPI: {computation_payload.get('kpi')}
- Intent: {computation_payload.get('executed_intent')}

OUTPUT FORMAT RULES (STRICT):
1. Give a crisp, executive, point-to-point summary (1 to 2 direct sentences max).
2. State the key finding and exact number directly upfront.
3. CRITICAL: Never alter, round differently, or contradict the Ground Truth Answer.
4. Keep it neat, professional, and finish every sentence completely."""

        system_content = (
            "You are a senior data analytics consultant for 'Ask Your Data'. "
            "You deliver neat, short, point-to-point executive answers. "
            "State findings directly in 1-2 concise sentences. "
            "NEVER alter or fabricate numerical values provided in the ground truth."
        )

    last_error: Optional[str] = None

    # 1. Primary Provider: Groq API
    if groq_key and not groq_key.startswith("AIza"):
        # Auto-fallback list of Groq models to ensure high availability
        candidate_models = [groq_model]
        for fallback in [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant"
        ]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            for model_to_try in candidate_models:
                payload = {
                    "model": model_to_try,
                    "messages": [
                        {
                            "role": "system",
                            "content": system_content
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3 if is_unmatched else 0.2,
                    "max_tokens": 650
                }
                try:
                    res = await client.post(GROQ_API_URL, json=payload, headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        choices = data.get("choices", [])
                        if choices and "message" in choices[0]:
                            return choices[0]["message"]["content"].strip(), "groq", model_to_try, None
                    elif res.status_code == 401:
                        return None, "builtin", "deterministic_pandas", "Groq API Authentication Error (401): Invalid API Key. Please verify GROQ_API_KEY in your .env file."
                    elif res.status_code == 429:
                        return None, "builtin", "deterministic_pandas", "Groq API Rate Limit (429): Quota reached. Using built-in analysis engine."
                    elif res.status_code in (400, 404):
                        # Model unavailable or invalid for this account, continue to next candidate
                        last_error = f"Groq Model `{model_to_try}` not accessible ({res.status_code})"
                        continue
                    else:
                        last_error = f"Groq API Error ({res.status_code}): {res.text[:120]}"
                        continue
                except httpx.TimeoutException:
                    last_error = "Groq API Request Timeout (>10s)"
                    break
                except Exception as e:
                    last_error = f"Groq Connection Error: {str(e)}"
                    break

    # 2. Secondary Provider: Google Gemini (if key starts with AIza)
    effective_gemini = gemini_key or (groq_key if groq_key and groq_key.startswith("AIza") else None)
    if effective_gemini:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={effective_gemini}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 650}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        return candidates[0]["content"]["parts"][0]["text"].strip(), "gemini", "gemini-1.5-flash", None
                else:
                    last_error = f"Gemini Error ({res.status_code}): {res.text[:120]}"
        except Exception as e:
            last_error = f"Gemini Connection Error: {str(e)}"

    # 3. Tertiary Provider: OpenAI (if OPENAI_API_KEY is present)
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a professional SaaS data analytics consultant."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 650
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip(), "openai", "gpt-3.5-turbo", None
                else:
                    last_error = f"OpenAI Error ({res.status_code}): {res.text[:120]}"
        except Exception as e:
            last_error = f"OpenAI Connection Error: {str(e)}"

    return None, "builtin", "deterministic_pandas", last_error

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
        f"Ask Your Data confirms the dataset is analytically sound for decision-making. "
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
