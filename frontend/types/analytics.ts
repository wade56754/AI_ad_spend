export interface OperatorRankingItem {
  operator_name: string;
  total_spend: number;
}

export interface ProjectTrendItem {
  project_name: string;
  month: string;
  spend: number;
}

export interface MonthlyReportData {
  operatorRanking: OperatorRankingItem[];
  projectTrend: ProjectTrendItem[];
}

export interface OperatorStat {
  operator_name: string;
  total_spend: number;
}

export interface ProjectStat {
  project_name: string;
  total_spend: number;
}

export interface MonthlyReportSummary {
  month: string;
  operator_stats: OperatorStat[];
  project_stats: ProjectStat[];
}

export interface AnalyticsMeta {
  total?: number;
  limit?: number;
  skip?: number;
}

export interface MonthlyReportResponse {
  data: MonthlyReportData;
  error: string | null;
  meta?: AnalyticsMeta | null;
}

export interface MonthlyReportSummaryResponse {
  data: MonthlyReportSummary[];
  error: string | null;
}

export interface DashboardStats {
  pendingReconciliations: number;
  todaySpend: number;
}

export interface DashboardStatsResponse {
  data: DashboardStats;
  error: string | null;
}
