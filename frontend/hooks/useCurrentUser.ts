"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";
import { UserInfo } from "@/types/auth";

interface UseCurrentUserState {
  user: UserInfo | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  error: string | null;
}

export function useCurrentUser(): UseCurrentUserState {
  const [state, setState] = useState<UseCurrentUserState>({
    user: null,
    roles: [],
    permissions: [],
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const response = await apiRequest<UserInfo>("/me");

    if (response.error || !response.data) {
      setState({
        user: null,
        roles: [],
        permissions: [],
        loading: false,
        error: response.error ?? "获取用户信息失败",
      });
      return;
    }

    setState({
      user: response.data,
      roles: response.data.roles ?? [],
      permissions: response.data.permissions ?? [],
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return state;
}

