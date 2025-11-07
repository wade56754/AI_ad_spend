"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import type {
  Operator,
  OperatorForm,
  OperatorListResponse,
  OperatorRole,
} from "@/types/operators";

const ROLE_OPTIONS: Array<{ value: OperatorRole; label: string }> = [
  { value: "operator", label: "投手" },
  { value: "finance", label: "财务" },
  { value: "account_mgr", label: "户管" },
];

const defaultFormState: OperatorForm = {
  name: "",
  role: "operator",
  join_date: "",
};

export function OperatorTable(): JSX.Element {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OperatorForm>(defaultFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchOperators = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void fetchOperators();
  }, [fetchOperators]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      setError(null);

      const payload: OperatorForm = {
        name: form.name,
        role: form.role,
        join_date: form.join_date || undefined,
      };

      const response = await apiRequest("/operators", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmitting(false);

      if (response.error) {
        setError(response.error);
        return;
      }

      setForm(defaultFormState);
      void fetchOperators();
    },
    [form, fetchOperators],
  );

  const rows = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            加载中...
          </TableCell>
        </TableRow>
      );
    }

    if (operators.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            暂无投手
          </TableCell>
        </TableRow>
      );
    }

    return operators.map((operator) => (
      <TableRow key={operator.id}>
        <TableCell>{operator.name}</TableCell>
        <TableCell>
          {ROLE_OPTIONS.find((option) => option.value === operator.role)?.label ?? operator.role}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {operator.join_date ? new Date(operator.join_date).toLocaleDateString() : "-"}
        </TableCell>
        <TableCell className="text-right text-sm text-muted-foreground">待支持编辑/删除</TableCell>
      </TableRow>
    ));
  }, [loading, operators]);

  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>新增投手</CardTitle>
          <CardDescription>维护投手列表便于后续分配项目与权限。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="name">
                投手姓名
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="role">
                角色
              </label>
              <select
                id="role"
                name="role"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                required
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="join_date">
                加入日期
              </label>
              <Input
                id="join_date"
                name="join_date"
                type="date"
                value={form.join_date ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, join_date: event.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "提交中..." : "新增投手"}
              </Button>
            </div>
          </form>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>投手列表</CardTitle>
          <CardDescription>未来可扩展分组、绩效统计、权限设置等功能。</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>加入时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

