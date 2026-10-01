# InsightIQ: REST API Specifications

The InsightIQ backend exposes a clean RESTful interface built with FastAPI. Interactive documentation is accessible locally at `http://127.0.0.1:8000/docs`.

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Route**: `/api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Jane Analyst",
    "email": "jane@insightiq.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Jane Analyst",
      "email": "jane@insightiq.com",
      "created_at": "2026-10-01T15:00:00Z"
    }
  }
  ```

---

## 2. Dataset Management

### Upload Dataset
- **Method**: `POST`
- **Route**: `/api/datasets/upload`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file` (binary), `name` (string, optional).
- **Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "user_id": 1,
    "name": "Quarterly Sales 2024",
    "file_name": "sales.csv",
    "file_type": "csv",
    "row_count": 1205,
    "column_count": 10,
    "created_at": "2026-10-01T15:05:00Z",
    "updated_at": "2026-10-01T15:05:00Z"
  }
  ```

### Initialize Retail Demo Dataset
- **Method**: `POST`
- **Route**: `/api/datasets/demo`
- **Response** (`200 OK`): Initializes and returns the Global Retail Sales demo dataset record.

---

## 3. Analytics & Profiling

### Dataset Profile & Quality Score
- **Method**: `GET`
- **Route**: `/api/datasets/{id}/profile`
- **Response**:
  ```json
  {
    "dataset_id": 1,
    "row_count": 1205,
    "column_count": 10,
    "missing_values": 24,
    "missing_pct": 0.2,
    "duplicate_rows": 5,
    "duplicate_pct": 0.42,
    "quality_score": 94.2,
    "columns": [
      {
        "name": "Sales",
        "data_type": "float64",
        "general_type": "numerical",
        "missing_count": 0,
        "missing_pct": 0.0,
        "unique_count": 870,
        "example_values": [2499.0, 450.0, 79.0],
        "min": 19.99,
        "max": 18500.0,
        "mean": 698.42,
        "std": 812.15
      }
    ],
    "missing_breakdown": [],
    "outliers_breakdown": []
  }
  ```

### Exploratory Data Analysis Statistics
- **Method**: `GET`
- **Route**: `/api/datasets/{id}/statistics`
- **Response**:
  ```json
  {
    "numerical": {
      "Sales": {
        "mean": 698.42,
        "median": 450.0,
        "min": 19.99,
        "max": 18500.0,
        "std": 812.15,
        "variance": 659587.62,
        "q25": 180.0,
        "q50": 450.0,
        "q75": 890.0,
        "iqr": 710.0
      }
    },
    "categorical": {
      "Category": {
        "unique_count": 4,
        "most_frequent": "Technology",
        "frequency": 460,
        "distribution": [
          { "category": "Technology", "count": 460, "percentage": 38.2 }
        ]
      }
    },
    "correlation_matrix": {
      "Sales": { "Sales": 1.0, "Profit": 0.68 }
    }
  }
  ```

---

## 4. Natural Language Queries (Ask InsightIQ)

### Submit Natural Query
- **Method**: `POST`
- **Route**: `/api/datasets/{id}/ask`
- **Request Body**:
  ```json
  {
    "question": "What is the average revenue?"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "The calculated average for **Sales** across all records is **$698.42**.",
    "response_type": "kpi",
    "kpi": {
      "label": "Average Sales",
      "value": "$698.42",
      "subtitle": "Computed across 1,205 entries"
    },
    "table": null,
    "chart": null,
    "conversation_id": 1,
    "message_id": 2,
    "executed_intent": "single_aggregation_mean",
    "mode": "builtin_engine"
  }
  ```

---

## 5. Cleaning & Reports

### Execute Cleaning Operations
- **Method**: `POST`
- **Route**: `/api/datasets/{id}/clean`
- **Request Body**:
  ```json
  {
    "auto_clean": true
  }
  ```
- **Response**:
  ```json
  {
    "dataset_id": 1,
    "rows_before": 1205,
    "rows_after": 1200,
    "columns_before": 10,
    "columns_after": 10,
    "changes_applied": [
      "Removed 5 duplicate row(s)",
      "Normalized column names",
      "Imputed 24 missing value(s) using median strategy"
    ],
    "quality_score_before": 94.2,
    "quality_score_after": 99.8
  }
  ```

### Generate Executive PDF Report
- **Method**: `POST`
- **Route**: `/api/datasets/{id}/report`
- **Response**: Compiles and saves publication PDF in `/data/reports/`.
