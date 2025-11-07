export type ChannelStatus = "active" | "disabled" | string;

export interface ChannelMeta {
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface Channel {
  id: number;
  name: string;
  contact?: string | null;
  rebate_rate?: number | string | null;
  status: ChannelStatus;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ChannelForm {
  name: string;
  contact?: string;
  rebate_rate?: number;
  status: ChannelStatus;
  note?: string;
}

export interface ChannelFormDraft {
  name: string;
  contact: string;
  rebate_rate: string;
  status: ChannelStatus;
  note: string;
}

export interface ChannelListResponse {
  data: Channel[];
  error: string | null;
  meta?: ChannelMeta | null;
}
