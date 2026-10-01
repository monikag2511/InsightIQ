export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Dataset {
  id: number;
  user_id?: number | null;
  name: string;
  file_name: string;
  file_type: string;
  row_count: number;
  column_count: number;
  created_at: string;
  updated_at: string;
}

export interface ColumnProfile {
  name: string;
  data_type: string;
  general_type: 'numerical' | 'categorical' | 'boolean' | 'datetime' | 'text';
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  example_values: (string | number | boolean)[];
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  std?: number | null;
}

export interface MissingColumnInfo {
  column: string;
  missing_count: number;
  missing_pct: number;
}

export interface OutlierColumnInfo {
  column: string;
  outlier_count: number;
  outlier_pct: number;
  lower_bound: number;
  upper_bound: number;
}

export interface DatasetProfile {
  dataset_id: number;
  row_count: number;
  column_count: number;
  missing_values: number;
  missing_pct: number;
  duplicate_rows: number;
  duplicate_pct: number;
  quality_score: number;
  columns: ColumnProfile[];
  missing_breakdown: MissingColumnInfo[];
  outliers_breakdown: OutlierColumnInfo[];
}

export interface PreviewData {
  columns: string[];
  column_types: Record<string, string>;
  rows: Record<string, any>[];
  total_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface NumericalStats {
  mean?: number | null;
  median?: number | null;
  mode?: number | null;
  min?: number | null;
  max?: number | null;
  range?: number | null;
  std?: number | null;
  variance?: number | null;
  q25?: number | null;
  q50?: number | null;
  q75?: number | null;
  iqr?: number | null;
}

export interface CategoricalFrequency {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoricalStats {
  unique_count: number;
  most_frequent?: string | null;
  frequency?: number | null;
  distribution: CategoricalFrequency[];
}

export interface StatisticsData {
  numerical: Record<string, NumericalStats>;
  categorical: Record<string, CategoricalStats>;
  correlation_matrix: Record<string, Record<string, number | null>>;
}

export interface ChartConfig {
  id: string;
  title: string;
  chart_type: 'line' | 'bar' | 'scatter' | 'donut' | 'histogram' | 'heatmap';
  x_axis?: string;
  y_axis?: string;
  description: string;
  data: any[];
}

export interface InsightItem {
  id: string;
  category: 'trend' | 'category' | 'correlation' | 'outlier' | 'quality' | 'distribution';
  title: string;
  description: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
  metric_highlight?: string;
}

export interface InsightsData {
  insights: InsightItem[];
  ai_summary?: string;
}

export interface KpiPayload {
  label: string;
  value: string | number;
  subtitle?: string;
  change_direction?: string;
}

export interface TablePayload {
  columns: string[];
  rows: Record<string, any>[];
  total_records: number;
}

export interface ChartPayload {
  chart_type: string;
  title: string;
  x_key: string;
  y_keys: string[];
  data: any[];
}

export interface AskResponse {
  answer: string;
  response_type: 'text' | 'kpi' | 'table' | 'chart' | 'mixed';
  kpi?: KpiPayload | null;
  table?: TablePayload | null;
  chart?: ChartPayload | null;
  conversation_id: number;
  message_id: number;
  executed_intent: string;
  mode: string;
  provider?: string | null;
  model?: string | null;
  ai_error?: string | null;
  disclaimer?: string | null;
}

export interface ConversationMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  response_type: string;
  payload_json?: string;
  created_at: string;
}

export interface ConversationHistory {
  id: number;
  dataset_id: number;
  title: string;
  messages: ConversationMessage[];
  created_at: string;
}

export interface CleaningResponse {
  dataset_id: number;
  rows_before: number;
  rows_after: number;
  columns_before: number;
  columns_after: number;
  changes_applied: string[];
  quality_score_before: number;
  quality_score_after: number;
}

export interface ReportItem {
  id: number;
  dataset_id: number;
  report_name: string;
  file_path: string;
  created_at: string;
}
