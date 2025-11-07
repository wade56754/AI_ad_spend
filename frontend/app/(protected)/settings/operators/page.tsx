"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import type { Operator, OperatorForm, OperatorListResponse, OperatorRole } from "@/types/operators";

const ROLE_OPTIONS: Array<{ value: OperatorRole; label: string }> = [
  { value: "operator", label: "投手" },
  { value: "finance", label: "财务" },
  { value: "manager", label: "管理" },
];

const initialForm: OperatorForm = {
  name: "",
  role: "operator",
  join_date: "",
};

export default function SettingsOperatorsPage(): JSX.Element {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OperatorForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchOperators = async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<OperatorListResponse>("/operators");
    if (response.error) {
      setError(response.error);
      setOperators([]);
    } else {
      setOperators(response.data?.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchOperators();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const payload: OperatorForm = {
      name: form.name,
      role: form.role,
      join_date: form.join_date || undefined,
    };

    const response = await apiRequest("/operators", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.error) {
      setForm(initialForm);
      await fetchOperators();
    } else {
      setError(response.error);
    }

    setSubmitting(false);
  };

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">投手管理</h1>
        <p className="text-sm text-muted-foreground">维护投手与相关角色信息，支持后续权限控制与绩效统计。</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>投手列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>加入时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : operators.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      暂无投手数据
                    </TableCell>
                  </TableRow>
                ) : (
                  operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell className="font-medium">{operator.name}</TableCell>
                      <TableCell>
                        {ROLE_OPTIONS.find((option) => option.value === operator.role)?.label ?? operator.role}
                      </TableCell>
                      <TableCell>{operator.join_date ? new Date(operator.join_date).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新增投手</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  姓名
                </label>
                <Input id="name" name="name" value={form.name} onChange={handleInputChange} required />
              </div>

              <div className="space-y-1">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">
                  角色
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="join_date" className="text-sm font-medium text-gray-700">
                  加入日期
                </label>
                <Input
                  id="join_date"
                  name="join_date"
                  type="date"
                  value={form.join_date ?? ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "提交中..." : "保存投手"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

