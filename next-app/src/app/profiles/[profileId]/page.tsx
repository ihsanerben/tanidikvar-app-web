import { permanentRedirect } from "next/navigation";

export default async function LegacyProfilePage({ params }: { params: Promise<{ profileId: string }> }) { permanentRedirect(`/tanidik/${(await params).profileId}`); }
