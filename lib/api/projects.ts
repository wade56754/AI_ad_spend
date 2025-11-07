import { apiRequest } from "./client";

export interface Project {
  id: number;
  name: string;
  code: string;
  status: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function fetchProjects(params: { status?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) {
    searchParams.append("status", params.status);
  }

  const query = searchParams.toString();
  return apiRequest<Project[]>(`/projects${query ? `?${query}` : ""}`);
}


