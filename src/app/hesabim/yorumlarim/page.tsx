import { ProfileAnswerHistory } from "@/components/profile-answer-history";

export const metadata = { title: "Yorumlarım", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ kapsam?: string; tur?: string }> }) {
  const params = await searchParams;
  return <ProfileAnswerHistory type={params.tur === "topluluk" ? "COMMUNITY" : "TANIDIK"} anonymousOnly={params.tur==="anonim"} scope={params.kapsam} unified />;
}
