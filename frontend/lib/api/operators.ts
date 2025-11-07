import { apiRequest } from "./client";

export interface Operator {
  id: number;
  name: string;
  project_id?: number;
  status?: string;
}

export async function fetchOperators(params: { projectId?: number; status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.projectId) {
    searchParams.append("project_id", String(params.projectId));
  }
  if (params.status) {
    searchParams.append("status", params.status);
  }

  const query = searchParams.toString();
  return apiRequest<Operator[]>(`/operators${query ? `?${query}` : ""}`);
}


