"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import type { DashboardStats, DashboardStatsResponse } from "@/types/analytics";

const defaultStats: DashboardStats = {
  pendingReconciliations: 0,
  todaySpend: 0,
};

export default function DashboardPage(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const response = await apiRequest<DashboardStatsResponse>("/analytics/dashboard");
      if (!response.error && response.data?.data) {
        setStats(response.data.data);
      } else {
        setStats(defaultStats);
      }
      setLoading(false);
    };

    void fetchStats();
  }, []);

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">仪表盘</h1>
        <p className="text-sm text-muted-foreground">快速了解今日核心业务状态。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>待确认对账</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-primary">
              {loading ? "-" : stats.pendingReconciliations}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">需尽快处理的对账记录数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今日投放消耗 (USDT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-primary">
              {loading ? "-" : stats.todaySpend.toFixed(2)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">投手今日上报的总消耗</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快捷入口</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <a className="text-primary underline" href="/report/spend">
              新增投手上报
            </a>
            <a className="text-primary underline" href="/finance/ledger">
              录入财务流水
            </a>
            <a className="text-primary underline" href="/reconcile">
              查看对账结果
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>通知提醒</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">后续接入异常预警后在此展示。</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

