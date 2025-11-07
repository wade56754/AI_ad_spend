"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest, type ApiResult } from "@/lib/api";

type HttpMethod = "GET" | "POST";

interface UseApiOptions<TRequest> {
  method?: HttpMethod;
  body?: TRequest;
  skip?: boolean;
  immediate?: boolean;
}

interface UseApiReturn<TResponse> {
  data: TResponse | null;
  error: string | null;
  loading: boolean;
  refetch: (overrideOptions?: { method?: HttpMethod; body?: unknown }) => Promise<ApiResult<TResponse>>;
}

export function useApi<TResponse = unknown, TRequest = unknown>(
  path: string,
  options: UseApiOptions<TRequest> = {},
): UseApiReturn<TResponse> {
  const { method = "GET", body, skip = false, immediate = true } = options;

  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const request = useCallback(
    async (override?: { method?: HttpMethod; body?: unknown }) => {
      const finalMethod = override?.method ?? method;
      const finalBody = override?.body ?? body;

      setLoading(true);

      const response = await apiRequest<TResponse>(path, {
        method: finalMethod,
        body: finalMethod === "GET" ? undefined : JSON.stringify(finalBody),
      });

      setData(response.data ?? null);
      setError(response.error ?? null);
      setLoading(false);

      return response;
    },
    [path, method, body],
  );

  const refetch = useCallback(
    (override?: { method?: HttpMethod; body?: unknown }) => request(override),
    [request],
  );

  useEffect(() => {
    if (skip || !immediate) {
      return;
    }
    void request();
  }, [skip, immediate, request]);

  return {
    data,
    error,
    loading,
    refetch,
  };
}


