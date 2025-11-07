import { apiRequest } from "./client";

export interface CreateAdSpendPayload {
  spend_date: string;
  project_id: number;
  channel_id: number;
  operator_id: number;
  country?: string;
  platform?: string;
  amount_usdt: number;
  raw_memo?: string;
}

export async function createAdSpend(payload: CreateAdSpendPayload) {
  return apiRequest<Record<string, unknown>>("/ad-spend", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


