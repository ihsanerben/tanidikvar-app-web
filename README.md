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
- `/`: Platform tanıtımı.
- `/register`, `/login`, `/account`: kayıt, giriş ve korumalı hesap ekranı.
- `/verify-email`, `/resend-verification`: e-posta doğrulama.
- `/forgot-password`, `/reset-password`: şifre sıfırlama.
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

Kayıt otomatik oturum açmaz; e-posta doğrulaması gerekir. Yerel backend Mailpit kullanır: http://localhost:8025 adresindeki e-postadan bağlantıyı aç. E-posta bağlantısı yalnız açılınca tüketilmez; doğrulama/sıfırlama düğmesiyle tamamlanır.

Merkezi API client credentials, CSRF, güvenli hata/field error/Retry-After ve en fazla bir 401 tekrarını yönetir. Eşzamanlı refresh ortak promise ile, sekmeler arası auth işlemleri localhost/HTTPS üzerinde Web Locks ile koordine edilir. Web Locks bulunmayan tarayıcılarda aynı sekme kilidi çalışır; sekmeler arası yarışın güvenli sonucu yeniden giriş gerektirebilir. JWT browser storage'a yazılmaz veya JavaScript ile okunmaz. Sekme tekrar odaklandığında hesap sunucudan doğrulanır.

Tarayıcı auth testleri API, web ve Mailpit'in çalışmasını gerektirir. `E2E_MAILPIT_URL` varsayılanı `http://localhost:8025`; `FRONTEND_URL` e-posta bağlantıları için test web origin'iyle eşleşmelidir. Testler rastgele `@example.test` hesapları ve yerel e-postalar oluşturur; fiziksel veri temizliği yapmaz. Rate limit nedeniyle kısa sürede çok sayıda test tekrarı `429` üretebilir; `Retry-After` süresini bekle.

Profil tamamlama, soru/cevap ve paneller sonraki teslimlerdir.
