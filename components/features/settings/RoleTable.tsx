"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import type { AdminRoleSummary, AdminRoleListResponse } from "@/types/admin";

export function RoleTable(): JSX.Element {
  const [roles, setRoles] = useState<AdminRoleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<AdminRoleListResponse>("/admin/roles");
    if (response.error) {
      setError(response.error);
      setRoles([]);
    } else {
      setRoles(response.data?.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = useMemo(() => {
    if (!filter.trim()) return roles;
    const keyword = filter.toLowerCase();
    return roles.filter((role) => role.name.toLowerCase().includes(keyword));
  }, [roles, filter]);

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

    if (filteredRoles.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            暂无角色
          </TableCell>
        </TableRow>
      );
    }

    return filteredRoles.map((role) => (
      <TableRow key={role.id}>
        <TableCell className="font-medium">{role.name}</TableCell>
        <TableCell className="text-sm text-muted-foreground">{role.description ?? "-"}</TableCell>
        <TableCell className="text-right text-sm text-muted-foreground">{role.permission_count ?? "-"}</TableCell>
        <TableCell className="text-right text-sm text-muted-foreground">待支持编辑/删除</TableCell>
      </TableRow>
    ));
  }, [filteredRoles, loading]);

  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>角色列表</CardTitle>
            <CardDescription>管理员可在此查看系统角色，后续支持编辑与权限分配。</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="搜索角色"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-48"
            />
            <Button variant="outline" size="sm" onClick={() => void fetchRoles()} disabled={loading}>
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <div className="px-4 py-2 text-sm text-red-600">{error}</div> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="text-right">权限数量</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>后续计划</CardTitle>
          <CardDescription>与后端接口完善后，可在此创建角色、配置权限。</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            当前仅展示基础数据。随着系统演进，可以在此添加角色详情、权限列表、批量导入导出等能力。
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

