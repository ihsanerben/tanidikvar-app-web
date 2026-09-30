import { AchievementBadge, type Achievement, type AchievementDefinition } from "@/components/achievement-badge";

async function load<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(new URL(path, process.env.API_BASE_URL ?? "http://localhost:8080"), { cache: "no-store" });
    return response.ok ? response.json() as Promise<T> : null;
  } catch {
    return null;
  }
}

export async function ProfileFeaturedBadges({ userId }: { userId: string }) {
  const [achievements, definitions] = await Promise.all([
    load<Achievement[]>(`/api/gamification/profiles/${userId}/achievements`),
    load<AchievementDefinition[]>("/api/gamification/achievements"),
  ]);
  const featured = achievements?.filter(item => item.featured).slice(0, 3) ?? [];
  if (!featured.length) return null;
  return <aside className="profile-featured-badges" aria-label="Seçilen rozetler">
    {featured.map(item => <AchievementBadge key={item.id} achievement={item} definition={definitions?.find(definition => definition.key === item.key) ?? { key: item.key, title: item.title, description: "Topluluğa yaptığın katkılar için kazanılan başarı rozeti.", icon: "★" }}/>) }
  </aside>;
}
