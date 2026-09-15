import { cookies } from "next/headers";
export type CurrentUser = { id: string; email: string; role: string; profileCompleted: boolean };
export type CurrentProfile = {
  firstName: string | null;
  lastName: string | null;
  educationStatus: string | null;
  education?: { universityName?: string | null; departmentName?: string | null } | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
};
export async function currentUser(): Promise<CurrentUser | null> {
  const cookie = (await cookies()).toString(); if (!cookie) return null;
  try { const response = await fetch(new URL("/api/me", process.env.API_BASE_URL ?? "http://localhost:8080"), { headers: { Cookie: cookie, Accept: "application/json" }, cache: "no-store" }); return response.ok ? response.json() : null; }
  catch { return null; }
}
export async function currentProfile(): Promise<CurrentProfile | null> {
  const cookie = (await cookies()).toString(); if (!cookie) return null;
  try { const response = await fetch(new URL("/api/me/profile", process.env.API_BASE_URL ?? "http://localhost:8080"), { headers: { Cookie: cookie, Accept: "application/json" }, cache: "no-store" }); return response.ok ? response.json() : null; }
  catch { return null; }
}
export async function authenticatedApi<T>(path: string): Promise<T | null> {
  const cookie = (await cookies()).toString(); if (!cookie) return null;
  try { const response = await fetch(new URL(`/api${path}`, process.env.API_BASE_URL ?? "http://localhost:8080"), { headers: { Cookie: cookie, Accept: "application/json" }, cache: "no-store" }); return response.ok ? response.json() : null; }
  catch { return null; }
}
