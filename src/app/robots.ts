import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5173";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/hesabim", "/yonetim", "/giris", "/kayit", "/e-posta-dogrula", "/dogrulama-yenile", "/parolami-unuttum", "/parola-yenile", "/arama"] }], sitemap: `${siteUrl}/sitemap.xml` };
}
