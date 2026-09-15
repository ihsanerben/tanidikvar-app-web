# TanıdıkVar Web

React 19, TypeScript 6 ve Vite 8 tabanlı SPA. API ile cookie/CSRF sözleşmesi üzerinden haberleşir.

## Çalıştırma

```bash
cp .env.example .env
npm install
npm run dev
```

Web manuel çalışır; Docker Compose frontend oluşturmaz. API ve yerel altyapı `tanidikvar-app-api` reposunda başlatılır.

## Doğrulama

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Değişikliğe en yakın kontrolden başla; tüm e2e paketi sentetik veri oluşturabileceği için günlük veritabanında gelişigüzel çalıştırılmaz.

## Yapılandırma

- `VITE_API_BASE_URL`: API adresi; yerelde varsayılan aynı-origin proxy düzeni kullanılabilir.
- `VITE_PILOT_MODE`: yalnız sınırlı pilot bildirimi ve ilgili davranışlar için.
- Vercel/Render pilot proxy ayrıntıları [deployment rehberindedir](docs/PRODUCTION_DEPLOYMENT.md).

Uygulanan ekranların ve sınırların kısa özeti [ortak mevcut mimaride](../docs/project/CURRENT_ARCHITECTURE.md), hedef ürün kuralları [ürün planında](../docs/project/PRODUCT_PLAN.md) tutulur. Eski ekran/test teslimat notları [arşivde](../docs/archive/WEB_README_HISTORY_2026-09-12.md) korunur.
