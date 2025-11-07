import { apiRequest } from "./client";

export interface Channel {
  id: number;
  name: string;
  contact?: string | null;
  rebate_rate?: number | string | null;
  status?: string | null;
  note?: string | null;
}

export async function fetchProjectChannels(projectId: number) {
  return apiRequest<Channel[]>(`/channels/projects/${projectId}/channels`);
}


