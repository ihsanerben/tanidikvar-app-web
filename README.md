# TanıdıkVar Web

React 19, TypeScript 6 ve Next.js 16 App Router tabanlı web uygulaması. API ile aynı-origin proxy, HttpOnly cookie ve CSRF sözleşmesi üzerinden haberleşir.

## Çalıştırma

```bash
cp .env.example .env.local
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde açılır. API ve yerel altyapı `tanidikvar-app-api` reposunda `./run.sh --docker` ile başlatılır.

## Doğrulama

```bash
npm run typecheck
npm run build
npm run test:session
```

## Yapılandırma

- `API_BASE_URL`: Next.js sunucusunun bağlanacağı API origin'i.
- `NEXT_PUBLIC_SITE_URL`: canonical, robots ve sitemap için web origin'i.

Uygulanan ekranların özeti [ortak mevcut mimaride](../docs/project/CURRENT_ARCHITECTURE.md), hedef ürün kuralları [ürün planında](../docs/project/PRODUCT_PLAN.md) tutulur.
