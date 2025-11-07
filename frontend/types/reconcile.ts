export type ReconcileStatus = "pending" | "matched" | "need_review" | string;

export interface ReconcileRecord {
  id: number;
  ad_spend_id: number | null;
  ledger_id: number | null;
  amount_diff: number;
  match_score: number;
  status: ReconcileStatus;
  created_at: string;
  updated_at?: string;
}

export interface ReconcileFilterDraft {
  status: string;
  startDate: string;
  endDate: string;
}

