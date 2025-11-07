"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { UserRoleDialog } from "@/components/features/settings/UserRoleDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/api";
import type { AdminRole, AdminUser, AdminUserListResponse } from "@/types/admin";

export default function SettingsUsersPage(): JSX.Element {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await apiRequest<AdminUserListResponse>("/admin/users");
    if (response.error) {
      setError(response.error);
      setUsers([]);
    } else {
      const payload = response.data?.data ?? [];
      const normalized = payload.map((user) => {
        const roles: AdminRole[] = (user.roles ?? []).map((role) =>
          typeof role === "string" ? { id: 0, name: role } : role,
        );
        return {
          ...user,
          roles,
        };
      });
      setUsers(normalized);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleRolesChange = useCallback(
    (userId: string, roles: AdminRole[]) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId
            ? {
                ...user,
                roles,
              }
            : user,
        ),
      );
    },
    [],
  );

  const tableRows = useMemo(() => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-muted-foreground">
            数据加载中...
          </TableCell>
        </TableRow>
      );
    }

    if (users.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={3} className="text-center text-muted-foreground">
            暂无用户数据
          </TableCell>
        </TableRow>
      );
    }

    return users.map((user) => (
      <TableRow key={user.user_id}>
        <TableCell className="font-medium">{user.email ?? user.user_id}</TableCell>
        <TableCell>
          {user.roles.length > 0 ? (
            user.roles.map((role) => role.name).join("、")
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
            分配角色
          </Button>
        </TableCell>
      </TableRow>
    ));
  }, [loading, users]);

  return (
    <main className="flex flex-col gap-6 px-4 py-8 sm:px-6 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">用户角色管理</h1>
        <p className="text-sm text-muted-foreground">查看所有账号并为其分配合适的角色权限。</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <div className="px-4 py-2 text-sm text-red-600">{error}</div> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser ? (
        <UserRoleDialog
          open={Boolean(selectedUser)}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRolesChange={(roles) => handleRolesChange(selectedUser.user_id, roles)}
        />
      ) : null}
    </main>
  );
}

