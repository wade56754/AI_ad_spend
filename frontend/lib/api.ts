const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta: any;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : '请求失败',
      meta: null,
    };
  }
}

export async function postAdSpend(data: {
  spend_date: string;
  project_id: number;
  channel_id: number;
  country?: string;
  operator_id: number;
  platform?: string;
  amount_usdt: number;
  raw_memo?: string;
}) {
  return apiRequest('/ad-spend', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function postLedger(data: {
  tx_date: string;
  direction: 'income' | 'expense';
  amount: number;
  currency?: string;
  account?: string;
  description?: string;
  fee_amount?: number;
  project_id?: number;
  operator_id?: number;
}) {
  return apiRequest('/ledger', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReconciliations(params?: {
  skip?: number;
  limit?: number;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  
  const query = queryParams.toString();
  return apiRequest(`/reconcile${query ? '?' + query : ''}`);
}

export async function updateReconciliation(id: number, status: string) {
  return apiRequest(`/reconcile/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// 渠道管理 API
export async function getChannels(params?: {
  skip?: number;
  limit?: number;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  
  const query = queryParams.toString();
  return apiRequest(`/channels${query ? '?' + query : ''}`);
}

export async function getProjectChannels(projectId: number) {
  return apiRequest(`/channels/projects/${projectId}/channels`);
}

export async function createChannel(data: {
  name: string;
  contact?: string;
  rebate_rate?: number;
  status?: string;
  note?: string;
}) {
  return apiRequest('/channels', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 项目管理 API
export async function getProjects(params?: {
  skip?: number;
  limit?: number;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  
  const query = queryParams.toString();
  return apiRequest(`/projects${query ? '?' + query : ''}`);
}

// 投手管理 API
export async function getOperators(params?: {
  skip?: number;
  limit?: number;
  project_id?: number;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.project_id !== undefined) queryParams.append('project_id', params.project_id.toString());
  if (params?.status) queryParams.append('status', params.status);
  
  const query = queryParams.toString();
  return apiRequest(`/operators${query ? '?' + query : ''}`);
}

