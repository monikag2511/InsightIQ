import os
import random
import datetime
import pandas as pd
import numpy as np

def generate_saas_dataset(output_path: str, count: int = 800):
    np.random.seed(101)
    random.seed(101)

    plans = {
        "Starter": (49, 0.08),
        "Professional": (149, 0.05),
        "Business": (399, 0.03),
        "Enterprise": (1299, 0.01)
    }
    industries = ["Fintech", "Healthcare", "E-commerce", "Edtech", "Logistics", "Marketing"]
    countries = ["United States", "United Kingdom", "Germany", "Canada", "Australia", "Singapore"]

    rows = []
    for i in range(1, count + 1):
        plan_name = random.choices(list(plans.keys()), weights=[0.45, 0.35, 0.15, 0.05])[0]
        base_mrr, churn_prob = plans[plan_name]

        seats = random.randint(1, 5) if plan_name == "Starter" else random.randint(5, 25) if plan_name == "Professional" else random.randint(25, 100) if plan_name == "Business" else random.randint(100, 500)
        mrr = round(base_mrr + (seats * 8.5) * random.uniform(0.9, 1.1), 2)
        nps = random.randint(20, 100)
        usage_hours = round(seats * random.uniform(15, 45), 1)

        # Churn status
        churned = random.random() < (churn_prob * (1.5 if nps < 50 else 0.7))

        rows.append({
            "Account_ID": f"ACC-{i:04d}",
            "Company_Name": f"Client {i}",
            "Industry": random.choice(industries),
            "Country": random.choice(countries),
            "Plan": plan_name,
            "Seats": seats,
            "Monthly_Recurring_Revenue": mrr,
            "Usage_Hours": usage_hours,
            "NPS_Score": nps,
            "Churn_Status": "Churned" if churned else "Active"
        })

    df = pd.DataFrame(rows)
    # Inject a few nulls in NPS_Score to test data quality
    null_idx = random.sample(range(len(df)), 12)
    for idx in null_idx:
        df.at[idx, "NPS_Score"] = np.nan

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated SaaS Demo Dataset at: {output_path}")

def generate_hr_dataset(output_path: str, count: int = 650):
    np.random.seed(202)
    random.seed(202)

    departments = {
        "Engineering": (115000, 25000),
        "Product": (105000, 20000),
        "Sales": (75000, 30000),
        "Marketing": (72000, 15000),
        "Customer Success": (58000, 12000),
        "Human Resources": (65000, 14000)
    }

    rows = []
    for i in range(1, count + 1):
        dept = random.choices(list(departments.keys()), weights=[0.35, 0.15, 0.22, 0.12, 0.10, 0.06])[0]
        base_salary, spread = departments[dept]
        tenure_years = round(random.uniform(0.5, 9.5), 1)

        salary = round(base_salary + (spread * random.uniform(-0.5, 1.2)) + (tenure_years * 3500), 2)
        perf_score = random.choices([1, 2, 3, 4, 5], weights=[0.05, 0.12, 0.50, 0.23, 0.10])[0]
        satisfaction = round(min(10.0, max(1.0, (perf_score * 1.6) + random.uniform(-1.0, 1.5))), 1)

        rows.append({
            "Employee_ID": f"EMP-{i:04d}",
            "Department": dept,
            "Tenure_Years": tenure_years,
            "Salary": salary,
            "Performance_Rating": perf_score,
            "Satisfaction_Score": satisfaction,
            "Remote_Work": random.choice(["Full Remote", "Hybrid", "On-Site"])
        })

    df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated HR Demo Dataset at: {output_path}")

if __name__ == "__main__":
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/demo"))
    generate_saas_dataset(os.path.join(base, "saas_subscriptions_demo.csv"))
    generate_hr_dataset(os.path.join(base, "employee_workforce_demo.csv"))
