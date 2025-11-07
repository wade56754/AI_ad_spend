"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import type { MonthlyReportData, MonthlyReportResponse } from "@/types/analytics";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

interface AnalyticsChartsProps {
  title?: string;
}

export function AnalyticsCharts({ title = "数据分析" }: AnalyticsChartsProps): JSX.Element {
  const [data, setData] = useState<MonthlyReportData>({ operatorRanking: [], projectTrend: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);

      const response = await apiRequest<MonthlyReportResponse>("/reports/monthly");
      if (response.error || !response.data) {
        setErrorMessage(response.error ?? "加载分析数据失败");
        setData({ operatorRanking: [], projectTrend: [] });
      } else {
        setData(response.data.data);
      }
      setLoading(false);
    };

    void fetchData();
  }, []);

  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>掌握投手消耗排名与项目趋势，辅助优化策略。</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">图表加载中...</p> : null}
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>投手消耗排行榜</CardTitle>
          <CardDescription>按月统计投手总消耗，识别核心投放人员。</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.operatorRanking}>
              <XAxis dataKey="operator_name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(59,130,246,0.1)" }} />
              <Legend />
              <Bar dataKey="total_spend" name="总消耗 (USDT)" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>项目消耗趋势</CardTitle>
          <CardDescription>分项目查看最近月份的消耗变化情况。</CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.projectTrend}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(16,185,129,0.1)" }} />
              <Legend />
              <Bar dataKey="spend" name="消耗 (USDT)" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}

