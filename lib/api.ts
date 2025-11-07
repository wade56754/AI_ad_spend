export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers,
    });

    if (!response.ok) {
      let message = response.statusText || "请求失败";
      try {
        const errorBody = await response.json();
        if (typeof errorBody === "string") {
          message = errorBody;
        } else if (errorBody && typeof errorBody.error === "string") {
          message = errorBody.error;
        }
      } catch {
        try {
          const text = await response.text();
          if (text) {
            message = text;
          }
        } catch {
          // ignore parsing errors
        }
      }
      return {
        data: null,
        error: message,
      };
    }

    let parsed: T | null = null;
    if (response.status !== 204) {
      try {
        parsed = (await response.json()) as T;
      } catch (parseError) {
        const message =
          parseError instanceof Error ? parseError.message : "响应解析失败";
        return { data: null, error: message };
      }
    }

    return { data: parsed, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "网络请求异常",
    };
  }
}
