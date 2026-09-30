import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { currentProfile, currentUser } from "@/lib/session";
import { plainProgramName } from "@/lib/program-label";
import {PageTitle} from "@/components/page-title";
import {ButtonLink} from "@/components/ui";
import {ProfileIdentityCard, TanidikProfileCard} from "@/components/profile-identity-card";
import {getTanidik} from "@/lib/api/profiles";
import {cookies} from "next/headers";
import type {ContributionSummary} from "@/components/account-report-button";

async function accountDetails(id: string): Promise<{summary: ContributionSummary | null; createdAt: string | null}> {
  const base = process.env.API_BASE_URL ?? "http://localhost:8080";
  const cookie = (await cookies()).toString();
  const [summary, publicProfile] = await Promise.all([
    fetch(new URL("/api/me/contribution-summary", base), {headers: {Cookie: cookie}, cache: "no-store"}).then(response => response.ok ? response.json() as Promise<ContributionSummary> : null).catch(() => null),
    fetch(new URL(`/api/profiles/${id}`, base), {cache: "no-store"}).then(response => response.ok ? response.json() as Promise<{createdAt: string}> : null).catch(() => null),
  ]);
  return {summary, createdAt: publicProfile?.createdAt ?? null};
}

export const metadata = { title: "Hesabım", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/giris");
  const profile = await currentProfile();
  const tanidikProfile = user.role === "TANIDIK" ? await getTanidik(user.id).catch(() => null) : null;
  const details = await accountDetails(user.id);
  const createdAt = details.createdAt ? new Intl.DateTimeFormat("tr-TR", {day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul"}).format(new Date(details.createdAt)) : null;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user.email;
  return <section className="legacy-account-page">
    <PageTitle help="Profilini, sorularını, yorumlarını, takiplerini, kayıtlarını, bildirimlerini ve Tanıdık başvurunu buradan yönetebilirsin.">Hesabım</PageTitle>
    {tanidikProfile ? <TanidikProfileCard account profile={tanidikProfile} contributionSummary={details.summary}/> : <ProfileIdentityCard account name={name} profileId={user.role==="MANAGER"?undefined:user.id} educationStatus={profile?.educationStatus} tanidik={user.role === "TANIDIK"} badgeLabel={user.role === "MANAGER" ? "Yönetici" : undefined} subtitle={[profile?.education?.universityName,plainProgramName(profile?.education?.departmentName)].filter(Boolean).join(" · ")} biography={profile?.biography} facts={[{label:"Şirket",value:profile?.company},{label:"Meslek",value:profile?.occupation},{label:"Mezuniyet yılı",value:profile?.graduationYear},{label:"Hesap açılışı",value:createdAt}]} links={[...(profile?.linkedinUrl?[{label:"LinkedIn",href:profile.linkedinUrl}]:[]),...(profile?.portfolioUrl?[{label:"Portfolyo",href:profile.portfolioUrl}]:[])]} contributionSummary={details.summary}/>}
    <div className="legacy-account-card">
      <nav className="legacy-account-links">
        <Link href="/hesabim/profil"><span>Profilimi düzenle</span><b aria-hidden="true">›</b></Link><Link href="/hesabim/bildirimler"><span>Bildirimler</span><b aria-hidden="true">›</b></Link><Link href="/hesabim/sorularim"><span>Sorularım</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/yorumlarim"><span>Yorumlarım</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/takipler"><span>Takipler</span><b aria-hidden="true">›</b></Link><Link href="/hesabim/kaydedilenler"><span>Kaydedilenler</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/rozetler"><span>Rozet vitrinim</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/tanidik-basvurusu"><span>Tanıdık başvurularım</span><b aria-hidden="true">›</b></Link>
        {user.role === "MANAGER" && <Link href="/yonetim"><span>Yönetim alanı</span><b aria-hidden="true">›</b></Link>}
      </nav>
      <div className="legacy-account-actions">
        <ButtonLink tone="secondary" className="account-suggestion-link" href="/hesabim/gelistirme-oner">Geliştirme öner</ButtonLink>
        <div className="legacy-account-logout"><LogoutButton /></div>
      </div>
    </div>
  </section>;
}
