export interface AdminRole {
  id: number;
  name: string;
  description?: string | null;
}

export interface AdminPermission {
  id: number;
  code: string;
  label: string;
  description?: string | null;
}

export interface AdminRoleWithPermissions extends AdminRole {
  permissions: AdminPermission[];
}

export interface AdminRoleSummary extends AdminRole {
  permissions?: AdminPermission[];
  permission_count?: number;
}

export interface AdminRoleListResponse {
  data: AdminRoleSummary[];
  error: string | null;
}

export interface AdminPermissionListResponse {
  data: AdminPermission[];
  error: string | null;
}

export interface AdminUser {
  user_id: string;
  email: string | null;
  roles: AdminRole[];
}

export interface AdminUserListResponse {
  data: AdminUser[];
  error: string | null;
}

