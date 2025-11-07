"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ReconciliationTable } from "@/components/features/reconciliation/ReconciliationTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import type { ReconcileFilterDraft, ReconcileRecord } from "@/types/reconcile";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "pending", label: "待处理" },
  { value: "matched", label: "已匹配" },
  { value: "need_review", label: "待复核" },
];

const INITIAL_FILTERS: ReconcileFilterDraft = {
  status: "",
  startDate: "",
  endDate: "",
};

export default function ReconcilePage(): JSX.Element {
  const [filters, setFilters] = useState<ReconcileFilterDraft>(INITIAL_FILTERS);
  const [data, setData] = useState<ReconcileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.startDate) params.set("start_date", filters.startDate);
    if (filters.endDate) params.set("end_date", filters.endDate);
    return params.toString();
  }, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<ReconcileRecord[]>(`/reconcile${queryString ? `?${queryString}` : ""}`);
    if (response.error) {
      setError(response.error);
      setData([]);
    } else {
      setData(response.data ?? []);
    }
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">自动对账结果</h1>
        <p className="text-sm text-muted-foreground">查看日报与财务流水的自动匹配情况，筛选需要复核的记录。</p>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              匹配状态
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              开始日期
            </label>
            <Input id="startDate" name="startDate" type="date" value={filters.startDate} onChange={handleInputChange} />
          </div>

          <div className="space-y-1">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
              结束日期
            </label>
            <Input id="endDate" name="endDate" type="date" value={filters.endDate} onChange={handleInputChange} />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={() => void fetchData()} disabled={loading}>
              {loading ? "加载中..." : "应用筛选"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFilters(INITIAL_FILTERS);
              }}
              disabled={loading}
            >
              重置
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <ReconciliationTable data={data} loading={loading} />
      </section>
    </main>
  );
}

