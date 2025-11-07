"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import type {
  MonthlyReportSummary,
  MonthlyReportSummaryResponse,
  OperatorStat,
  ProjectStat,
} from "@/types/analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function AnalyticsPage(): JSX.Element {
  const [reports, setReports] = useState<MonthlyReportSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      const response = await apiRequest<MonthlyReportSummaryResponse>("/reports/monthly");
      if (response.error) {
        setError(response.error);
        setReports([]);
      } else {
        setReports(response.data?.data ?? []);
      }

      setLoading(false);
    };

    void fetchReports();
  }, []);

  const operatorRanking = useMemo(() => {
    const totals = new Map<string, number>();
    reports.forEach((report) => {
      report.operator_stats?.forEach((item: OperatorStat) => {
        totals.set(item.operator_name, (totals.get(item.operator_name) ?? 0) + item.total_spend);
      });
    });

    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [reports]);

  const projectTrend = useMemo(() => {
    return reports.map((report) => {
      const total = report.project_stats?.reduce(
        (sum: number, item: ProjectStat) => sum + item.total_spend,
        0,
      ) ?? 0;
      return { month: report.month, value: total };
    });
  }, [reports]);

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">数据分析</h1>
        <p className="text-sm text-muted-foreground">汇总投手执行成效与项目消耗趋势，辅助管理层决策。</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>投手消耗排行榜</CardTitle>
            <p className="text-sm text-muted-foreground">统计周期内的总消耗，展示前 10 位投手</p>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">加载中...</div>
            ) : operatorRanking.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={operatorRanking} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value).replace("US$", "")} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>项目消耗趋势</CardTitle>
            <p className="text-sm text-muted-foreground">按月汇总项目消耗金额，洞察投放趋势</p>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">加载中...</div>
            ) : projectTrend.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">暂无数据</div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={projectTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

