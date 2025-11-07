export type OperatorRole = "operator" | "finance" | "manager" | string;

export interface OperatorMeta {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface Operator {
  id: number;
  name: string;
  role: OperatorRole;
  join_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OperatorForm {
  name: string;
  role: OperatorRole;
  join_date?: string;
}

export interface OperatorListResponse {
  data: Operator[];
  error: string | null;
  meta?: OperatorMeta | null;
}
