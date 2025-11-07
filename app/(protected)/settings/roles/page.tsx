"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { RolePermissionDialog } from "@/components/features/settings/RolePermissionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import type {
  AdminPermission,
  AdminRoleListResponse,
  AdminRoleSummary,
} from "@/types/admin";

export default function SettingsRolesPage(): JSX.Element {
  const [roles, setRoles] = useState<AdminRoleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [editingRole, setEditingRole] = useState<AdminRoleSummary | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<AdminRoleListResponse>("/admin/roles");
    if (response.error) {
      setError(response.error);
      setRoles([]);
    } else {
      const fetched = response.data?.data ?? [];
      setRoles(
        fetched.map((role) => ({
          ...role,
          permissions: role.permissions ?? [],
          permission_count: role.permission_count ?? role.permissions?.length,
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = useMemo(() => {
    if (!filter.trim()) {
      return roles;
    }
    const keyword = filter.toLowerCase();
    return roles.filter((role) => role.name.toLowerCase().includes(keyword));
  }, [roles, filter]);

  const handlePermissionsUpdated = useCallback(
    (roleId: number, permissions: AdminPermission[]) => {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === roleId
            ? {
                ...role,
                permissions,
                permission_count: permissions.length,
              }
            : role,
        ),
      );
    },
    [],
  );

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">角色与权限</h1>
        <p className="text-sm text-muted-foreground">查看系统中已定义的角色，了解对应权限配置。</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>角色列表</CardTitle>
            <CardDescription>管理员可以在数据库或后续管理面板中维护角色与权限。</CardDescription>
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
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    数据加载中...
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    暂无匹配的角色
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {role.description || "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {role.permission_count ?? role.permissions?.length ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditingRole(role)}>
                        编辑权限
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>后续计划</CardTitle>
          <CardDescription>未来版本可在此增加角色创建、权限编辑等操作。</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            当前页面作为角色管理骨架，已完成数据读取与展示。随着后台接口完善，可以继续扩展角色创建、权限勾选以及批量管理等功能。
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            TODO: 接入后端权限管理接口，支持新增/删除权限、角色备注编辑等高级操作。
          </p>
        </CardContent>
      </Card>

      {editingRole ? (
        <RolePermissionDialog
          open
          role={{ ...editingRole, permissions: editingRole.permissions ?? [] }}
          onClose={() => setEditingRole(null)}
          onUpdated={(permissions) => {
            handlePermissionsUpdated(editingRole.id, permissions);
            setEditingRole(null);
          }}
        />
      ) : null}
    </main>
  );
}

