import type { ContributionSummary } from "@/components/account-report-button";

export async function getProfileContributionSummary(id: string): Promise<ContributionSummary | null> {
  try {
    const response = await fetch(new URL(`/api/profiles/${id}/contribution-summary`, process.env.API_BASE_URL ?? "http://localhost:8080"), { cache: "no-store" });
    return response.ok ? response.json() as Promise<ContributionSummary> : null;
  } catch {
    return null;
  }
}
