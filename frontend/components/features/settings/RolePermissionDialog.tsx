"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import type {
  AdminPermission,
  AdminPermissionListResponse,
  AdminRoleWithPermissions,
} from "@/types/admin";

interface RolePermissionDialogProps {
  role: AdminRoleWithPermissions;
  open: boolean;
  onClose: () => void;
  onUpdated: (permissions: AdminPermission[]) => void;
}

export function RolePermissionDialog({ role, open, onClose, onUpdated }: RolePermissionDialogProps): JSX.Element | null {
  const [allPermissions, setAllPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(role.permissions.map((item) => item.id)));

  useEffect(() => {
    setSelectedIds(new Set(role.permissions.map((item) => item.id)));
  }, [role]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const fetchPermissions = async () => {
      setLoading(true);
      setError(null);
      const response = await apiRequest<AdminPermissionListResponse>("/admin/permissions");
      if (response.error || !response.data) {
        setError(response.error ?? "加载权限列表失败");
        setAllPermissions([]);
      } else {
        setAllPermissions(response.data.data);
      }
      setLoading(false);
    };

    void fetchPermissions();
  }, [open]);

  const togglePermission = (permissionId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(permissionId);
      } else {
        next.delete(permissionId);
      }
      return next;
    });
  };

  const selectedPermissions = useMemo(() => {
    if (allPermissions.length === 0) {
      return [] as AdminPermission[];
    }
    return allPermissions.filter((perm) => selectedIds.has(perm.id));
  }, [allPermissions, selectedIds]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const payload = {
      permission_ids: Array.from(selectedIds),
    };

    // TODO: 将批量更新逻辑与后端实际实现保持一致
    const response = await apiRequest(`/admin/roles/${role.id}/permissions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    onUpdated(selectedPermissions);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">编辑角色权限</CardTitle>
            <p className="text-xs text-muted-foreground">{role.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">权限列表加载中...</p>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto rounded-md border border-muted p-3">
              <div className="flex flex-col gap-3">
                {allPermissions.map((permission) => {
                  const checked = selectedIds.has(permission.id);
                  return (
                    <label key={permission.id} className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => togglePermission(permission.id, Boolean(value))}
                      />
                      <div className="space-y-1 text-sm">
                        <span className="font-medium">{permission.label || permission.code}</span>
                        <p className="text-xs text-muted-foreground">{permission.code}</p>
                        {permission.description ? (
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
                {allPermissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无权限可配置</p>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              取消
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting || loading}>
              {submitting ? "保存中..." : "保存权限"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

