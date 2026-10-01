from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Dataset Schemas ---
class DatasetResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    file_name: str
    file_type: str
    row_count: int
    column_count: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = {"from_attributes": True}

# --- Profile & Quality Schemas ---
class ColumnProfile(BaseModel):
    name: str
    data_type: str
    general_type: str  # 'numerical', 'categorical', 'boolean', 'datetime', 'text'
    missing_count: int
    missing_pct: float
    unique_count: int
    example_values: List[Any]
    min: Optional[Union[float, int, str]] = None
    max: Optional[Union[float, int, str]] = None
    mean: Optional[float] = None
    std: Optional[float] = None

class OutlierColumnInfo(BaseModel):
    column: str
    outlier_count: int
    outlier_pct: float
    lower_bound: float
    upper_bound: float

class MissingColumnInfo(BaseModel):
    column: str
    missing_count: int
    missing_pct: float

class DatasetProfileResponse(BaseModel):
    dataset_id: int
    row_count: int
    column_count: int
    missing_values: int
    missing_pct: float
    duplicate_rows: int
    duplicate_pct: float
    quality_score: float
    columns: List[ColumnProfile]
    missing_breakdown: List[MissingColumnInfo]
    outliers_breakdown: List[OutlierColumnInfo]

# --- Preview Schemas ---
class PreviewResponse(BaseModel):
    columns: List[str]
    column_types: Dict[str, str]
    rows: List[Dict[str, Any]]
    total_rows: int
    page: int
    page_size: int
    total_pages: int

# --- Data Cleaning Schemas ---
class CleaningOperation(BaseModel):
    operation: str # 'remove_duplicates', 'fill_missing', 'drop_missing_rows', 'drop_empty_columns', 'normalize_names', 'remove_outliers'
    column: Optional[str] = None
    strategy: Optional[str] = None # 'mean', 'median', 'mode', 'constant', 'drop'
    fill_value: Optional[Any] = None

class CleaningRequest(BaseModel):
    operations: Optional[List[CleaningOperation]] = None
    auto_clean: bool = False

class CleaningResponse(BaseModel):
    dataset_id: int
    rows_before: int
    rows_after: int
    columns_before: int
    columns_after: int
    changes_applied: List[str]
    quality_score_before: float
    quality_score_after: float

# --- Analytics & Statistics Schemas ---
class NumericalStats(BaseModel):
    mean: Optional[float] = None
    median: Optional[float] = None
    mode: Optional[Union[float, int]] = None
    min: Optional[float] = None
    max: Optional[float] = None
    range: Optional[float] = None
    std: Optional[float] = None
    variance: Optional[float] = None
    q25: Optional[float] = None
    q50: Optional[float] = None
    q75: Optional[float] = None
    iqr: Optional[float] = None

class CategoricalFrequency(BaseModel):
    category: str
    count: int
    percentage: float

class CategoricalStats(BaseModel):
    unique_count: int
    most_frequent: Optional[str] = None
    frequency: Optional[int] = None
    distribution: List[CategoricalFrequency]

class StatisticsResponse(BaseModel):
    numerical: Dict[str, NumericalStats]
    categorical: Dict[str, CategoricalStats]
    correlation_matrix: Dict[str, Dict[str, Optional[float]]]

# --- Visualizations Schemas ---
class ChartConfig(BaseModel):
    id: str
    title: str
    chart_type: str # 'line', 'bar', 'scatter', 'box', 'donut', 'histogram', 'heatmap'
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    description: str
    data: List[Dict[str, Any]]

class VisualizationsResponse(BaseModel):
    charts: List[ChartConfig]

# --- Insights Schemas ---
class InsightItem(BaseModel):
    id: str
    category: str # 'trend', 'category', 'correlation', 'outlier', 'quality', 'distribution'
    title: str
    description: str
    severity: str # 'info', 'success', 'warning', 'alert'
    metric_highlight: Optional[str] = None

class InsightsResponse(BaseModel):
    insights: List[InsightItem]
    ai_summary: Optional[str] = None

# --- Ask InsightIQ Schemas ---
class AskRequest(BaseModel):
    question: str
    conversation_id: Optional[int] = None

class ChartPayload(BaseModel):
    chart_type: str
    title: str
    x_key: str
    y_keys: List[str]
    data: List[Dict[str, Any]]

class TablePayload(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_records: int

class KpiPayload(BaseModel):
    label: str
    value: Union[float, int, str]
    subtitle: Optional[str] = None
    change_direction: Optional[str] = None

class AskResponse(BaseModel):
    answer: str
    response_type: str # 'text', 'kpi', 'table', 'chart', 'mixed'
    kpi: Optional[KpiPayload] = None
    table: Optional[TablePayload] = None
    chart: Optional[ChartPayload] = None
    conversation_id: int
    message_id: int
    executed_intent: str
    mode: str # 'ai_llm' or 'builtin_engine'

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    response_type: str
    payload_json: Optional[str] = None
    created_at: datetime.datetime

class ConversationHistoryResponse(BaseModel):
    id: int
    dataset_id: int
    title: str
    messages: List[MessageResponse]
    created_at: datetime.datetime

# --- Reports Schemas ---
class ReportGenerateRequest(BaseModel):
    report_name: Optional[str] = "InsightIQ Executive Report"

class ReportResponse(BaseModel):
    id: int
    dataset_id: int
    report_name: str
    file_path: str
    created_at: datetime.datetime
