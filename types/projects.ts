export interface ProjectMeta {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface Project {
  id: number;
  name: string;
  code?: string | null;
  status?: string | null;
  country?: string | null;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProjectForm {
  name: string;
  country?: string;
  description?: string;
}

export interface ProjectListResponse {
  data: Project[];
  error: string | null;
  meta?: ProjectMeta | null;
}
