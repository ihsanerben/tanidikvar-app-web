import { TanidikStars } from "@/components/tanidik-stars";
import { ProfileFeaturedBadges } from "@/components/profile-featured-badges";
import { ProfileShareButton } from "@/components/profile-share-button";
import { AccountReportButton, type ContributionSummary } from "@/components/account-report-button";
import type { PublicTanidik } from "@/lib/api/profiles";
import type { ReactNode } from "react";

type Fact = { label: string; value: string | number | null | undefined };
type LinkItem = { label: string; href: string };

export function ProfileIdentityCard({
  name, educationStatus, subtitle, biography, tanidik = false, account = false, badgeLabel,
  facts = [], links = [], featuredBadges, profileId, contributionSummary,
}: {
  name: string;
  educationStatus?: string | null;
  subtitle: string;
  biography?: string | null;
  tanidik?: boolean;
  account?: boolean;
  badgeLabel?: string;
  facts?: Fact[];
  links?: LinkItem[];
  featuredBadges?: ReactNode;
  profileId?: string;
  contributionSummary?: ContributionSummary | null;
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("tr-TR");
  const educationLabel = educationStatus === "MEZUN" ? "Mezun" : educationStatus === "UNIVERSITE_OGRENCISI" ? "Üniversite öğrencisi" : educationStatus === "YKS_ADAYI" ? "YKS adayı" : "Üye";
  return <section className={`legacy-public-profile-card redesigned-tanidik-card profile-identity-card role-${(educationStatus ?? "user").toLowerCase()}${tanidik ? "" : " is-member"}${links.length || account || profileId ? " has-profile-links" : ""}${profileId ? " has-share" : ""}`}>
    <div className="tanidik-profile-avatar"><span className={`legacy-avatar large role-${(educationStatus ?? "user").toLowerCase()}${tanidik ? " is-tanidik" : ""}`}><span>{initials}</span>{tanidik && <TanidikStars educationStatus={educationStatus}/>}</span>{(links.length > 0 || account || profileId) && <aside className="tanidik-profile-links" aria-label="Profil bağlantıları">{links.map(link => <a className="profile-social-link" key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} bağlantısını aç`}><span className="profile-social-icon" aria-hidden="true">{link.label === "LinkedIn" ? <svg viewBox="0 0 24 24" fill="none"><path d="M3.5 3.5h17v17h-17zM7.5 10v7.5m0-10v.1M11.5 17.5V10m0 3.5c0-2.2 1.4-3.5 3.2-3.5 2 0 3.1 1.2 3.1 3.5v4"/></svg> : <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.7 5.5 3.7 9s-1.2 6.5-3.7 9M12 3C9.5 5.5 8.3 8.5 8.3 12s1.2 6.5 3.7 9"/></svg>}</span><span>{link.label === "LinkedIn" ? "LinkedIn" : "Web sitesi"}</span></a>)}{(account || profileId) && <AccountReportButton summary={contributionSummary ?? null}/>}</aside>}</div>
    <div className="tanidik-profile-main">{account ? <h2>{name}</h2> : <h1>{name}</h1>}<p className="tanidik-profile-education">{subtitle && <>{subtitle} · </>}<span className="profile-education-role">{educationLabel}</span></p>{badgeLabel && <div className="tanidik-profile-badges"><strong>{badgeLabel}</strong></div>}{biography && <p className="tanidik-profile-biography">{biography}</p>}{facts.length > 0 && <div className="tanidik-profile-facts">{facts.map(fact => <div key={fact.label}><small>{fact.label}</small><strong>{fact.value === "" ? "—" : fact.value ?? "—"}</strong></div>)}</div>}</div>
    {featuredBadges}
    {profileId&&<ProfileShareButton name={name} path={`${tanidik?"/tanidik":"/profiles"}/${profileId}`}/>}
  </section>;
}

export function TanidikProfileCard({ profile, account = false, contributionSummary }: { profile: PublicTanidik; account?: boolean; contributionSummary?: ContributionSummary | null }) {
  const createdAt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(profile.createdAt));
  return <ProfileIdentityCard
    account={account} tanidik name={profile.name} profileId={profile.id} educationStatus={profile.educationStatus}
    subtitle={[profile.universityName, profile.departmentName].filter(Boolean).join(" · ")}
    biography={profile.biography}
    facts={[{ label: "Şirket", value: profile.company }, { label: "Meslek", value: profile.occupation }, { label: "Mezuniyet yılı", value: profile.graduationYear }, { label: "Hesap açılışı", value: createdAt }]}
    contributionSummary={contributionSummary}
    links={[...(profile.linkedinUrl ? [{ label: "LinkedIn", href: profile.linkedinUrl }] : []), ...(profile.portfolioUrl ? [{ label: "Portfolyo", href: profile.portfolioUrl }] : [])]}
    featuredBadges={<ProfileFeaturedBadges userId={profile.id}/>}
  />;
}
