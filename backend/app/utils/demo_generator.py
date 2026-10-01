import os
import random
import datetime
import pandas as pd
import numpy as np

def generate_demo_dataset(num_records: int = 1200, output_path: str = None) -> pd.DataFrame:
    """
    Generates a realistic retail sales dataset with authentic correlations,
    seasonal trends, realistic margins, a few outliers, and controlled missing values.
    """
    np.random.seed(42)
    random.seed(42)

    categories_products = {
        "Technology": [
            ("MacBook Pro 16", 2499.00, 0.28),
            ("Dell XPS 15", 1799.00, 0.22),
            ("UltraWide 34in Monitor", 649.00, 0.35),
            ("Wireless Noise-Canceling Headphones", 299.00, 0.45),
            ("Logitech MX Master 3S Mouse", 99.00, 0.50),
            ("Mechanical RGB Keyboard", 149.00, 0.42),
            ("USB-C Thunderbolt Dock", 199.00, 0.38)
        ],
        "Furniture": [
            ("Ergonomic Mesh Chair", 450.00, 0.30),
            ("Electric Standing Desk", 750.00, 0.25),
            ("Solid Oak Conference Table", 1850.00, 0.20),
            ("Steel Filing Cabinet", 220.00, 0.28),
            ("Acoustic Office Partition", 340.00, 0.32),
            ("LED Desk Lamp with Wireless Charger", 79.00, 0.55)
        ],
        "Office Supplies": [
            ("Premium Copy Paper Carton", 45.00, 0.35),
            ("Gel Ink Pens (Box of 50)", 28.00, 0.60),
            ("Heavy-Duty Stapler & Staples", 35.00, 0.48),
            ("Presentation Whiteboard 6x4", 180.00, 0.40),
            ("Archival Binder Set", 42.00, 0.52),
            ("Thermal Label Printer", 160.00, 0.36)
        ],
        "Apparel": [
            ("Corporate Softshell Jacket", 85.00, 0.55),
            ("Embroidered Polo Shirt", 38.00, 0.62),
            ("Fleece Quarter-Zip Pullover", 65.00, 0.58),
            ("High-Visibility Safety Vest", 24.00, 0.65)
        ]
    }

    regions = ["North", "South", "East", "West", "Central"]
    first_names = [
        "Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Robin",
        "Casey", "Jamie", "Avery", "Cameron", "Dakota", "Reese", "Skyler",
        "Jesse", "Kendall", "Logan", "Peyton", "Riley", "Emerson", "Finley"
    ]
    last_names = [
        "Vance", "Chen", "Patel", "Smith", "Rodriguez", "Kim", "O'Connor",
        "Williams", "Nakamura", "Al-Mansoor", "Dubois", "Larsson", "Muller",
        "Kowalski", "Santos", "Novak", "Takahashi", "Rossi", "Schmidt", "Murphy"
    ]
    customer_pool = [f"{random.choice(first_names)} {random.choice(last_names)}" for _ in range(120)]

    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date(2024, 12, 31)
    days_range = (end_date - start_date).days

    rows = []
    for i in range(1, num_records + 1):
        order_id = f"ORD-2024-{i:05d}"
        
        # Date selection with Q4 seasonal spike (Black Friday / Year-end budget spend)
        day_offset = random.randint(0, days_range)
        order_date = start_date + datetime.timedelta(days=day_offset)
        month = order_date.month

        # Weighted category selection
        cat = random.choices(
            ["Technology", "Furniture", "Office Supplies", "Apparel"],
            weights=[0.38, 0.28, 0.24, 0.10]
        )[0]
        product_info = random.choice(categories_products[cat])
        product_name, base_price, base_margin = product_info

        # Region with realistic distribution
        region = random.choices(
            regions,
            weights=[0.28, 0.18, 0.26, 0.20, 0.08]
        )[0]

        customer = random.choice(customer_pool)

        # Quantity: usually 1 to 8, with corporate bulk orders occasionally
        if random.random() < 0.06:
            qty = random.randint(12, 45) # bulk order
        else:
            qty = random.randint(1, 8)

        # Price fluctuation (+- 5%)
        unit_price = round(base_price * (1 + random.uniform(-0.05, 0.05)), 2)

        # Seasonal discount in Nov/Dec or promo
        discount = 0.0
        if month in [11, 12] and random.random() < 0.5:
            discount = random.choice([0.10, 0.15, 0.20])
        elif random.random() < 0.15:
            discount = random.choice([0.05, 0.10])

        sales = round(qty * unit_price * (1.0 - discount), 2)

        # Profit calculation with cost and margin
        cost = unit_price * (1.0 - base_margin) * qty
        profit = round(sales - cost, 2)

        rows.append({
            "Order_ID": order_id,
            "Order_Date": order_date.isoformat(),
            "Customer_Name": customer,
            "Region": region,
            "Category": cat,
            "Product": product_name,
            "Quantity": qty,
            "Unit_Price": unit_price,
            "Sales": sales,
            "Profit": profit
        })

    df = pd.DataFrame(rows)

    # Inject a few intentional realistic outliers for outlier detection:
    # 1. Mega enterprise order
    outlier_idx1 = random.randint(10, 50)
    df.at[outlier_idx1, "Quantity"] = 120
    df.at[outlier_idx1, "Sales"] = round(120 * df.at[outlier_idx1, "Unit_Price"] * 0.85, 2)
    df.at[outlier_idx1, "Profit"] = round(df.at[outlier_idx1, "Sales"] * 0.25, 2)

    # 2. Defective batch return (loss)
    outlier_idx2 = random.randint(60, 100)
    df.at[outlier_idx2, "Profit"] = -round(df.at[outlier_idx2, "Sales"] * 0.6, 2)

    # Inject 1.5% realistic missing values in Customer_Name and Profit to demonstrate Data Quality
    missing_cust_indices = random.sample(range(len(df)), int(len(df) * 0.015))
    for idx in missing_cust_indices:
        df.at[idx, "Customer_Name"] = np.nan

    missing_profit_indices = random.sample(range(len(df)), int(len(df) * 0.012))
    for idx in missing_profit_indices:
        df.at[idx, "Profit"] = np.nan

    # Inject 5 duplicate rows to demonstrate Duplicate Detection & Cleaning
    dup_indices = random.sample(range(200, 400), 5)
    dups = df.iloc[dup_indices].copy()
    df = pd.concat([df, dups], ignore_index=True)

    if output_path:
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        df.to_csv(output_path, index=False)
        json_path = output_path.replace(".csv", ".json")
        df.to_json(json_path, orient="records", date_format="iso", indent=2)

    return df

if __name__ == "__main__":
    demo_csv = os.path.join(os.path.dirname(__file__), "../../../data/demo/retail_sales_demo.csv")
    generate_demo_dataset(1200, demo_csv)
    print("Demo dataset generated successfully at:", demo_csv)
