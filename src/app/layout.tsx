import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import "./globals.css";
import "./fixes.css";
import "./question-form.css";
import "./university.css";
import "./page-polish.css";
import { currentProfile, currentUser } from "@/lib/session";
import { HeaderPrimaryNav } from "@/components/header-primary-nav";
import { NotificationProvider } from "@/components/notification-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173"),
  title: { default: "TanıdıkVar — Kariyer Yolunda Bir Tanıdığın Olsun", template: "%s | TanıdıkVar" },
  description: "Üniversite ve bölümleri; taban puanları, başarı sıralamaları ve gerçek öğrenci-mezun deneyimleriyle keşfet, karşılaştır ve sorularını sor.",
  keywords:["üniversite tercihleri","bölüm seçimi","taban puanları","başarı sıralaması","öğrenci yorumları"],
  openGraph: {
    siteName: "TanıdıkVar", locale: "tr_TR", type: "website", url: "/",
    title: "TanıdıkVar — Kariyer Yolunda Bir Tanıdığın Olsun",
    description: "Üniversite ve bölümleri gerçek öğrenci ve mezun deneyimleriyle keşfet, karşılaştır ve merak ettiklerini sor.",
    images: [{ url: "/tanidikvar-social-card.png", width: 1200, height: 630, alt: "Kampüste deneyimlerini paylaşan üniversite öğrencileri — TanıdıkVar" }],
  },
  twitter: {
    card: "summary_large_image", site: "@tanidikvar",
    title: "TanıdıkVar — Kariyer Yolunda Bir Tanıdığın Olsun",
    description: "Üniversite ve bölümleri gerçek öğrenci ve mezun deneyimleriyle keşfet, karşılaştır ve merak ettiklerini sor.",
    images: ["/tanidikvar-social-card.png"],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await currentUser();
  const profile = user ? await currentProfile() : null;
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user?.email || "Üye";
  const education = profile?.educationStatus ?? "USER";
  const roleLabel: Record<string,string> = {YKS_ADAYI:"YKS Adayı",UNIVERSITE_OGRENCISI:"Üniversite Öğrencisi",MEZUN:"Mezun",USER:"Üye"};
  const starCount = education === "MEZUN" ? 3 : education === "UNIVERSITE_OGRENCISI" ? 2 : 1;
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
       <NotificationProvider>
        <a className="skip-link" href="#main-content">İçeriğe geç</a>
        <header className="site-header legacy-header">
          <Link className="brand" href="/sorular" aria-label="TanıdıkVar sorular sayfası"><Image className="brand-logo-full" src="/logo.svg" alt="" width={158} height={38} priority /><Image className="brand-logo-mark" src="/logo-mark.svg" alt="" width={38} height={38} priority /></Link>
          <HeaderPrimaryNav />
          {user ? <Link className={`legacy-account account-role-${education.toLowerCase()}${user.role==="TANIDIK"?" is-tanidik":""}`} href={user.role === "MANAGER" ? "/yonetim" : "/hesabim"}>{user.role==="TANIDIK"&&<span className="gold-stars" aria-hidden="true">{Array.from({length:starCount},(_,index)=><span key={index}>★</span>)}</span>}<span className="legacy-account-person"><strong>{name}</strong></span><i aria-hidden="true"/><span className="legacy-account-action"><b>{user.role==="MANAGER"?"Yönetim":"Hesabım"}</b><small>{user.role==="MANAGER"?"Manager":roleLabel[education]??education}</small></span></Link> : <Link className="button" href="/giris">Giriş yap</Link>}
        </header>
        <main id="main-content">{children}</main>
        <footer className="site-footer legacy-footer"><Link className="brand footer-brand" href="/sorular" aria-label="TanıdıkVar sorular sayfası"><Image src="/logo-wordmark.svg" alt="" width={110} height={28} /></Link><span>Kariyer yolunda bir tanıdığın olsun.</span><nav aria-label="Alt menü"><Link href="/universiteler">Üniversiteler</Link><Link href="/programlar">Programlar</Link><Link href="/istatistikler">İstatistikler</Link><Link href="/hakkimizda#iletisim">İletişim</Link><Link href="/durum">Sistem durumu ↗</Link></nav></footer>
       </NotificationProvider>
      </body>
    </html>
  );
}
