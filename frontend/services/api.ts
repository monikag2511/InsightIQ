const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('insightiq_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText || `HTTP Error ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string }) {
    const res = await request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.access_token && typeof window !== 'undefined') {
      localStorage.setItem('insightiq_token', res.access_token);
      localStorage.setItem('insightiq_user', JSON.stringify(res.user));
    }
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.access_token && typeof window !== 'undefined') {
      localStorage.setItem('insightiq_token', res.access_token);
      localStorage.setItem('insightiq_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('insightiq_token');
      localStorage.removeItem('insightiq_user');
    }
  },

  async getMe() {
    return request<any>('/api/auth/me');
  },

  // Datasets
  async uploadDataset(file: File, name?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);

    const headers: Record<string, string> = { ...getAuthHeader() };
    const response = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return response.json();
  },

  async loadDemoDataset() {
    return request<any>('/api/datasets/demo', { method: 'POST' });
  },

  async listDatasets() {
    return request<any[]>('/api/datasets');
  },

  async getDataset(id: number) {
    return request<any>(`/api/datasets/${id}`);
  },

  async deleteDataset(id: number) {
    const response = await fetch(`${API_BASE_URL}/api/datasets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error('Failed to delete dataset');
    return true;
  },

  // Preview & Profile
  async getPreview(id: number, page = 1, pageSize = 25, search = '', sortBy = '', sortOrder = 'asc') {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      sort_order: sortOrder,
    });
    if (search) params.append('search', search);
    if (sortBy) params.append('sort_by', sortBy);

    return request<any>(`/api/datasets/${id}/preview?${params.toString()}`);
  },

  async getProfile(id: number) {
    return request<any>(`/api/datasets/${id}/profile`);
  },

  // Cleaning
  async cleanDataset(id: number, operations?: any[], autoClean = false) {
    return request<any>(`/api/datasets/${id}/clean`, {
      method: 'POST',
      body: JSON.stringify({ operations, auto_clean: autoClean }),
    });
  },

  // Analytics & Visualizations
  async getStatistics(id: number) {
    return request<any>(`/api/datasets/${id}/statistics`);
  },

  async getVisualizations(id: number) {
    return request<any>(`/api/datasets/${id}/visualizations`);
  },

  async getInsights(id: number) {
    return request<any>(`/api/datasets/${id}/insights`);
  },

  // Ask InsightIQ
  async askQuestion(id: number, question: string, conversationId?: number) {
    return request<any>(`/api/datasets/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, conversation_id: conversationId }),
    });
  },

  async getConversations(id: number) {
    return request<any[]>(`/api/datasets/${id}/history`);
  },

  async clearConversations(id: number) {
    return fetch(`${API_BASE_URL}/api/datasets/${id}/history`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
  },

  // Reports
  async generateReport(id: number, reportName?: string) {
    return request<any>(`/api/datasets/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ report_name: reportName }),
    });
  },

  getReportDownloadUrl(id: number, reportId: number) {
    return `${API_BASE_URL}/api/datasets/${id}/reports/${reportId}/download`;
  },

  getExportUrl(id: number, format: 'csv' | 'excel' = 'csv') {
    return `${API_BASE_URL}/api/datasets/${id}/export?format=${format}`;
  },
};
