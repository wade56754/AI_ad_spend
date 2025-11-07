"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/api";
import type {
  AdminRole,
  AdminRoleListResponse,
  AdminRoleSummary,
  AdminUser,
} from "@/types/admin";

interface UserRoleDialogProps {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onRolesChange: (roles: AdminRole[]) => void;
}

export function UserRoleDialog({ user, open, onClose, onRolesChange }: UserRoleDialogProps): JSX.Element | null {
  const [allRoles, setAllRoles] = useState<AdminRoleSummary[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set(user.roles.map((role) => role.id)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    setSelected(new Set(user.roles.map((role) => role.id)));
  }, [user]);

  useEffect(() => {
    if (!open) return;

    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      const response = await apiRequest<AdminRoleListResponse>("/admin/roles");
      if (response.error) {
        setError(response.error);
        setAllRoles([]);
      } else {
        setAllRoles(response.data?.data ?? []);
      }
      setLoading(false);
    };

    void fetchRoles();
  }, [open]);

  const roleById = useMemo(() => new Map(allRoles.map((role) => [role.id, role])), [allRoles]);

  const rebuildRoles = useCallback(
    (ids: Set<number>): AdminRole[] =>
      Array.from(ids).map((id) => {
        const role = roleById.get(id);
        if (role) {
          return { id: role.id, name: role.name };
        }
        const existing = user.roles.find((item) => item.id === id);
        return existing ?? { id, name: String(id) };
      }),
    [roleById, user.roles],
  );

  const handleToggle = useCallback(
    async (role: AdminRoleSummary, checked: boolean) => {
      setToggling(role.id);
      setError(null);

      if (checked) {
        const response = await apiRequest(`/admin/users/${user.user_id}/roles`, {
          method: "POST",
          body: JSON.stringify({ role_id: role.id }),
        });
        if (response.error) {
          setError(response.error);
        } else {
          setSelected((prev) => {
            const next = new Set(prev);
            next.add(role.id);
            onRolesChange(rebuildRoles(next));
            return next;
          });
        }
      } else {
        const response = await apiRequest(`/admin/users/${user.user_id}/roles/${role.id}`, {
          method: "DELETE",
        });
        if (response.error) {
          setError(response.error);
        } else {
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(role.id);
            onRolesChange(rebuildRoles(next));
            return next;
          });
        }
      }
      setToggling(null);
    },
    [user.user_id, rebuildRoles, onRolesChange],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">分配角色</h2>
            <p className="text-xs text-muted-foreground">{user.email ?? user.user_id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">角色加载中...</div>
          ) : error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          ) : allRoles.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">暂无角色可分配</div>
          ) : (
            <ul className="space-y-3">
              {allRoles.map((role) => {
                const checked = selected.has(role.id);
                const disabled = toggling === role.id;
                return (
                  <li key={role.id} className="flex items-start gap-3 rounded-md border border-muted/50 p-3">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(value) => {
                        const nextChecked = Boolean(value);
                        void handleToggle(role, nextChecked);
                      }}
                    />
                    <div className="flex-1 text-sm">
                      <label htmlFor={`role-${role.id}`} className="font-medium">
                        {role.name}
                      </label>
                      {role.description ? (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            完成
          </Button>
        </div>
      </div>
    </div>
  );
}

