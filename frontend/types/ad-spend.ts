export interface AdSpendForm {
  spend_date: string;
  project_id: number | null;
  country: string;
  platform: string;
  amount_usdt: number;
  raw_memo?: string;
}

export interface AdSpendFormDraft {
  spend_date: string;
  project_id: string;
  country: string;
  platform: string;
  amount_usdt: string;
  raw_memo: string;
}

export interface AdSpendRecord extends AdSpendForm {
  id: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

