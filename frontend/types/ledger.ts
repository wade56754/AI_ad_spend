export interface LedgerForm {
  ledger_date: string;
  direction: "income" | "expense";
  amount_usdt: number;
  currency: "USD" | "INR" | "CNY" | string;
  account_name: string;
  description?: string;
  fee_usdt?: number;
}

export interface LedgerFormDraft {
  ledger_date: string;
  direction: "income" | "expense";
  amount_usdt: string;
  currency: "USD" | "INR" | "CNY" | string;
  account_name: string;
  description: string;
  fee_usdt: string;
}

export interface LedgerRecord extends LedgerForm {
  id: number;
  created_at: string;
  updated_at?: string;
}

