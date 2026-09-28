import { ProfileAnswerHistory } from "@/components/profile-answer-history";

export const metadata = { title: "Yorumlarım", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ kapsam?: string; tur?: string; anonim?: string; sayfa?: string }> }) {
  const params = await searchParams;
  return <ProfileAnswerHistory type={params.tur === "topluluk" ? "COMMUNITY" : "TANIDIK"} anonymousOnly={params.anonim === "1" || params.tur === "anonim"} page={Number(params.sayfa) || 0} scope={params.kapsam} unified />;
}
