import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }];
  },
  async redirects() {
    return [
      ["/login", "/giris"], ["/register", "/kayit"], ["/verify-email", "/e-posta-dogrula"],
      ["/resend-verification", "/dogrulama-yenile"], ["/forgot-password", "/parolami-unuttum"], ["/reset-password", "/parola-yenile"],
      ["/questions/new", "/soru-sor"], ["/questions", "/sorular"], ["/popular", "/populer"], ["/admins", "/tanidiklar"],
      ["/my-answers", "/hesabim/topluluk-yorumlarim"], ["/my-questions", "/hesabim/sorularim"], ["/profile", "/hesabim/profil"],
      ["/applications", "/hesabim/tanidik-basvurusu"], ["/account", "/hesabim"], ["/account/status", "/durum"], ["/about", "/hakkimizda"],
      ["/manager", "/yonetim"], ["/manager/users", "/yonetim/kullanicilar"], ["/manager/content", "/yonetim/icerik"],
      ["/manager/catalog", "/yonetim/katalog"], ["/manager/tags", "/yonetim/tagler"], ["/manager/analytics", "/yonetim/analitik"],
      ["/manager/reports", "/yonetim/raporlar"], ["/manager/applications", "/yonetim/basvurular"], ["/manager/actions", "/yonetim/islemler"],
      ["/manager/account", "/yonetim/hesabim"],
      ["/admins/:id", "/tanidik/:id"], ["/admin", "/hesabim/tanidik-yorumlarim"],
      ["/manager/users/:id", "/yonetim/kullanicilar/:id"], ["/manager/applications/:id", "/yonetim/basvurular/:id"],
      ["/manager/questions/:id", "/yonetim/sorular/:id"], ["/manager/actions/:id", "/yonetim/islemler/:id"],
    ].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
