import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamificationCard } from "@/components/gamification-card";
import { getProfileAnswers } from "@/lib/api/answers";
import { getTanidik } from "@/lib/api/profiles";
import { questionSegment } from "@/lib/public-url";

type Props = { params: Promise<{ profileId: string }>; searchParams: Promise<{ yorum?: string }> };
async function resolveProfile(id: string) { try { return await getTanidik(id); } catch { notFound(); } }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const profile = await resolveProfile((await params).profileId); return { title: `${profile.name} · Tanıdık`, description: `${profile.name} tarafından paylaşılan doğrulanmış üniversite deneyimleri.`, alternates: { canonical: `/tanidik/${profile.id}` } }; }

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const profile = await resolveProfile((await params).profileId), answers = await getProfileAnswers(profile.id);
  const selectedType = (await searchParams).yorum === "topluluk" ? "COMMUNITY" : "TANIDIK";
  const visibleAnswers = answers.filter(answer => answer.answerType === selectedType);
  const initials = profile.name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("tr-TR");
  const educationRole = profile.educationStatus === "MEZUN" ? "Mezun" : profile.educationStatus === "UNIVERSITE_OGRENCISI" ? "Üniversite öğrencisi" : "YKS adayı";
  const createdAt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(profile.createdAt));
  return <article className={`legacy-public-profile profile-role-${(profile.educationStatus??"user").toLowerCase()}`}>
    <nav className="breadcrumb" aria-label="İçerik yolu"><Link href="/tanidiklar">Tanıdıklar</Link><span>›</span><span>{profile.name}</span></nav>
    <section className="legacy-public-profile-card redesigned-tanidik-card">
      <div className="tanidik-profile-avatar"><span className={`legacy-avatar large is-tanidik role-${(profile.educationStatus??"user").toLowerCase()}`}><span>{initials}</span><i>★★★</i></span>{(profile.linkedinUrl || profile.portfolioUrl) && <aside className="tanidik-profile-links" aria-label="Profil bağlantıları">{profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>}{profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolyo <span>↗</span></a>}</aside>}</div>
      <div className="tanidik-profile-main"><h1>{profile.name}</h1><p className="tanidik-profile-education">{[profile.universityName, profile.departmentName].filter(Boolean).join(" · ") || educationRole}</p><div className="tanidik-profile-badges"><span>{educationRole}</span><strong>Tanıdık</strong>{profile.educationVerified && <i title="Eğitim kimliği doğrulandı">✓</i>}</div>{profile.biography && <p className="tanidik-profile-biography">{profile.biography}</p>}<div className="tanidik-profile-facts">{profile.graduationYear && <div><small>Mezuniyet yılı</small><strong>{profile.graduationYear}</strong></div>}<div><small>Meslek</small><strong>{profile.occupation || "—"}</strong></div><div><small>Şirket</small><strong>{profile.company || "—"}</strong></div><div><small>Hesap açılışı</small><strong>{createdAt}</strong></div></div></div>
      <div className="metric-grid"><div><strong>{profile.tanidikAnswerCount + profile.communityAnswerCount}</strong><span>cevap</span></div><div><strong>{profile.helpfulVoteCount}</strong><span>faydalı oy</span></div><div><strong>{profile.bestAnswerCount}</strong><span>en iyi cevap</span></div><div><strong>{profile.helpedPeopleCount}</strong><span>yardım edilen kişi</span></div></div>
    </section>
    <section className="legacy-profile-contributions"><h2>Katkılar</h2><nav className="legacy-contribution-tabs" aria-label="Yorum türü"><Link scroll={false} className={selectedType === "TANIDIK" ? "active" : ""} aria-current={selectedType === "TANIDIK" ? "page" : undefined} href={`/tanidik/${profile.id}?yorum=tanidik`}>Tanıdık yorumları <span>{profile.tanidikAnswerCount}</span></Link><Link scroll={false} className={selectedType === "COMMUNITY" ? "active" : ""} aria-current={selectedType === "COMMUNITY" ? "page" : undefined} href={`/tanidik/${profile.id}?yorum=topluluk`}>Topluluk yorumları <span>{profile.communityAnswerCount}</span></Link></nav>{visibleAnswers.length ? <ol className="legacy-profile-answer-list">{visibleAnswers.map(answer => <li key={answer.id}><header><div className="legacy-profile-answer-author"><span className={`legacy-avatar role-${(profile.educationStatus??"user").toLowerCase()} is-tanidik`}><span>{initials}</span><i>★★★</i></span><strong>{profile.name}</strong></div><span className="legacy-profile-answer-likes">♥ {answer.likeCount}</span></header><p>{answer.body}</p><footer><time dateTime={answer.publishedAt}>{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(answer.publishedAt))}</time><Link href={`/soru/${questionSegment(answer.questionTitle??"soru",answer.questionId)}`}>Soru detayı</Link></footer></li>)}</ol> : <div className="empty-state"><h3>Bu bölümde henüz yorum yok</h3><p>Yeni katkılar burada görünecek.</p></div>}</section>
    <GamificationCard userId={profile.id} />
  </article>;
}
