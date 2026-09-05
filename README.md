# TanıdıkVar Web

Bağımsız frontend reposu: React + TypeScript + Vite. API reposunun konumuna veya üst klasördeki dosyalara bağımlı değildir; backend'e yapılandırılan HTTP adresiyle bağlanır.

## Kurulum ve çalıştırma

Node 22.12 veya üstü ve npm gerekir. Bu klasörde:

```bash
npm install
./run.sh
```

`run.sh`, yoksa `.env.example` dosyasını `.env` olarak kopyalar; mevcut ayarları korur. Yalnız web uygulamasını başlatır. `.env` içindeki `VITE_API_BASE_URL` backend adresi, `WEB_PORT` web portudur. API ayrıca çalıştırılmalıdır. Backend CORS ayarı web origin'ine izin vermelidir.

- Web: http://localhost:5173
- `/`: Platform tanıtımı; soru/kayıt ekranı henüz yok.
- `/durum`: Gerçek backend health API'si; API kapalıysa hata ve yeniden deneme gösterir.
- Diğer yollar: 404 ekranı.

`npm run dev` de kullanılabilir; özel port için `./run.sh` veya Vite `--port` parametresi gerekir. Frontend `.env` yalnız public değer taşır; gerçek `.env` yine `.gitignore` ile hariç tutulur. Secret veya backend DB bilgisi bu repoda bulunmaz.

## Doğrulama

```bash
npm test
npm run lint
npm run build
```

API ve web çalışırken gerçek tarayıcı testleri:

```bash
npx playwright install chromium
npm run test:e2e
```

Özel web adresinde `E2E_BASE_URL` kullanılır. Backend hiçbir yerel klasör yoluyla bulunmaz; web'in `VITE_API_BASE_URL` adresinden erişilir.

JWT login/refresh, korumalı route ve mutation CSRF client akışı sonraki auth tesliminde uygulanacaktır. Mevcut merkezi API client salt okumalar içindir.
