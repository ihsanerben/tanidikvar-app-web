export type ApiFailure = { code?: string; message?: string; fieldErrors?: Record<string, string> };
let refreshRequest: Promise<boolean> | null = null;

type NavigatorWithLocks = Navigator & { locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> } };

async function csrfToken() {
  const response = await fetch("/api/backend/auth/csrf", { credentials: "include", cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null) as { token?: unknown } | null;
  return typeof payload?.token === "string" ? payload.token : null;
}

async function refreshOnce() {
  const token = await csrfToken();
  if (!token) return false;
  return fetch("/api/backend/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "X-XSRF-TOKEN": token },
  }).then(response => response.ok).catch(() => false);
}

async function refreshAfterLock() {
  const current = await fetch("/api/backend/me", { credentials: "include", cache: "no-store" }).catch(() => null);
  if (current?.ok) return true;
  if (current && current.status !== 401) return false;
  return refreshOnce();
}

function noticeBody(body: BodyInit | null | undefined): unknown {
  if (typeof body !== "string") return body;
  try { return JSON.parse(body) as unknown; }
  catch { return body; }
}

async function refreshSession() {
  if (!refreshRequest) {
    const locks = (navigator as NavigatorWithLocks).locks;
    refreshRequest = (locks ? locks.request("tanidikvar-auth", refreshAfterLock) : refreshOnce())
      .finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, true);
}

async function request<T>(path: string, init: RequestInit, canRefresh: boolean): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET"; const headers = new Headers(init.headers); headers.set("Accept", "application/json");
  if (!["GET", "HEAD"].includes(method)) { const csrf = await fetch("/api/backend/auth/csrf", { credentials: "include", cache: "no-store" }); const payload = await csrf.json() as { token: string }; headers.set("X-XSRF-TOKEN", payload.token); if (init.body) headers.set("Content-Type", "application/json"); }
  const response = await fetch(`/api/backend${path}`, { ...init, method, headers, credentials: "include", cache: "no-store" });
  if (response.status === 401 && canRefresh && !path.startsWith("/auth/") && await refreshSession()) return request<T>(path, init, false);
  if (!response.ok) { const failure = await response.json().catch(() => ({})) as ApiFailure; throw new Error(failure.message ?? "İşlem tamamlanamadı."); }
  if (!["GET", "HEAD"].includes(method)) mutationNotice(path, method, noticeBody(init.body));
  if (response.status === 204) return undefined as T;
  const text = await response.text(); return text ? JSON.parse(text) as T : undefined as T;
}
import { mutationNotice } from "@/lib/notifications";
