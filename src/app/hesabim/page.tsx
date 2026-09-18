import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { currentProfile, currentUser } from "@/lib/session";
import { plainProgramName } from "@/lib/program-label";
import {PageTitle} from "@/components/page-title";

export const metadata = { title: "Hesabım", robots: { index: false, follow: false } };
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(item => item[0]).join("").toLocaleUpperCase("tr-TR");
const role = (status?: string | null) => ({ MEZUN: "Mezun", UNIVERSITE_OGRENCISI: "Üniversite Öğrencisi", YKS_ADAYI: "YKS Adayı" }[status ?? ""] ?? "Üye");

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/giris");
  const profile = await currentProfile();
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user.email;
  return <section className="legacy-account-page">
    <PageTitle help="Profilini, sorularını, yorumlarını, takiplerini, kayıtlarını, bildirimlerini ve Tanıdık başvurunu buradan yönetebilirsin.">Hesabım</PageTitle>
    <div className="legacy-account-card">
      <div className="legacy-account-identity">
        <span className={`legacy-avatar large role-${(profile?.educationStatus ?? "user").toLowerCase()}${user.role === "TANIDIK" ? " is-tanidik" : ""}`}><span>{initials(name)}</span>{user.role === "TANIDIK" && <i>★★★</i>}</span>
        <h2>{name}</h2><p>{user.email}</p>
        {(profile?.linkedinUrl || profile?.portfolioUrl) && <div className="legacy-account-socials">
          {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
          {profile.portfolioUrl && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Portfolyo ↗</a>}
        </div>}
      </div>
      <dl className={`legacy-account-summary role-${(profile?.educationStatus ?? "user").toLowerCase()}`}>
        <div><dt>Üniversite</dt><dd>{profile?.education?.universityName || "—"}</dd></div>
        <div><dt>Bölüm</dt><dd>{profile?.education?.departmentName ? plainProgramName(profile.education.departmentName) : "—"}</dd></div>
        <div><dt>Eğitim durumu</dt><dd>{role(profile?.educationStatus)}</dd></div>
        <div><dt>Yetki</dt><dd>{user.role === "TANIDIK" ? "Tanıdık" : user.role === "MANAGER" ? "Manager" : "Üye"}</dd></div>
      </dl>
      <nav className="legacy-account-links">
        <Link href="/hesabim/profil"><span>Profilimi düzenle</span><b aria-hidden="true">›</b></Link><Link href="/hesabim/sorularim"><span>Sorularım</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/yorumlarim"><span>Yorumlarım</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/takipler"><span>Takipler</span><b aria-hidden="true">›</b></Link><Link href="/hesabim/kaydedilenler"><span>Kaydedilenler</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/bildirimler"><span>Bildirimler</span><b aria-hidden="true">›</b></Link><Link href="/hesabim/rozetler"><span>Rozet vitrini</span><b aria-hidden="true">›</b></Link>
        <Link href="/hesabim/tanidik-basvurusu"><span>Tanıdık başvurularım</span><b aria-hidden="true">›</b></Link>
        {user.role === "MANAGER" && <Link href="/yonetim"><span>Yönetim alanı</span><b aria-hidden="true">›</b></Link>}
      </nav>
      <div className="legacy-account-logout"><LogoutButton /></div>
    </div>
  </section>;
}
