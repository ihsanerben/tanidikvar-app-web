import {TanidikStars} from "@/components/tanidik-stars";
import {TanidikProfileCard} from "@/components/profile-identity-card";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileAnswers } from "@/lib/api/answers";
import { getProfileContributionSummary } from "@/lib/api/profile-contributions";
import { getTanidik } from "@/lib/api/profiles";
import { questionSegment } from "@/lib/public-url";

type Props = { params: Promise<{ profileId: string }>; searchParams: Promise<{ yorum?: string }> };
async function resolveProfile(id: string) { try { return await getTanidik(id); } catch { notFound(); } }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const profile = await resolveProfile((await params).profileId); return { title: `${profile.name} · Tanıdık`, description: `${profile.name} tarafından paylaşılan üniversite deneyimleri.`, alternates: { canonical: `/tanidik/${profile.id}` } }; }

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const profile = await resolveProfile((await params).profileId);
  const [answers, contributionSummary] = await Promise.all([getProfileAnswers(profile.id), getProfileContributionSummary(profile.id)]);
  const selectedType = (await searchParams).yorum === "topluluk" ? "COMMUNITY" : "TANIDIK";
  const visibleAnswers = answers.filter(answer => answer.answerType === selectedType);
  const initials = profile.name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("tr-TR");
  return <article className={`legacy-public-profile profile-role-${(profile.educationStatus??"user").toLowerCase()}`}>
    <nav className="breadcrumb" aria-label="İçerik yolu"><Link href="/tanidiklar">Tanıdıklar</Link><span>›</span><span>{profile.name}</span></nav>
    <TanidikProfileCard profile={profile} contributionSummary={contributionSummary}/>
    <section className="legacy-profile-contributions"><h2>Katkılar</h2><nav className="legacy-contribution-tabs" aria-label="Yorum türü"><Link scroll={false} className={selectedType === "TANIDIK" ? "active" : ""} aria-current={selectedType === "TANIDIK" ? "page" : undefined} href={`/tanidik/${profile.id}?yorum=tanidik`}>Tanıdık yorumları <span>{profile.tanidikAnswerCount}</span></Link><Link scroll={false} className={selectedType === "COMMUNITY" ? "active" : ""} aria-current={selectedType === "COMMUNITY" ? "page" : undefined} href={`/tanidik/${profile.id}?yorum=topluluk`}>Topluluk yorumları <span>{profile.communityAnswerCount}</span></Link></nav>{visibleAnswers.length ? <ol className="legacy-profile-answer-list">{visibleAnswers.map(answer => <li key={answer.id}><header><div className="legacy-profile-answer-author"><span className={`legacy-avatar role-${(profile.educationStatus??"user").toLowerCase()} is-tanidik`}><span>{initials}</span><TanidikStars educationStatus={profile.educationStatus}/></span><strong>{profile.name}</strong></div></header><p>{answer.body}</p><footer><time dateTime={answer.publishedAt}>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(answer.publishedAt))}</time><Link href={`/soru/${questionSegment(answer.questionTitle??"soru",answer.questionId)}`}>Soru detayı</Link></footer></li>)}</ol> : <div className="empty-state"><h3>Bu bölümde henüz yorum yok</h3><p>Yeni katkılar burada görünecek.</p></div>}</section>
  </article>;
}
