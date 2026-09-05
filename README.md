# TanıdıkVar Web

Bağımsız frontend reposu: React + TypeScript + Vite. API reposunun konumuna veya üst klasördeki dosyalara bağımlı değildir; backend'e yapılandırılan HTTP adresiyle bağlanır.

## Tüm sistemi Docker ile açma

API reposunda `./run.sh --docker` çalıştır. Web de kendi Dockerfile'ından derlenerek Nginx ile http://localhost:5173 üzerinde açılır; Node/npm'nin host üzerinde çalışması gerekmez. API reposunun `.env` dosyasındaki `WEB_BUILD_CONTEXT` bu reponun konumunu gösterir (varsayılan komşu klasör). Bu repo yalnız public build arg `VITE_API_BASE_URL=/` alır; backend secret'ları build'e aktarılmaz.

Docker web `/api` isteklerini `API_UPSTREAM` adresine proxy eder; default `http://api:8080`. Doğrudan `/profile` veya `/manager` gibi yollar SPA fallback ile açılır. Docker görüntüsü derlenmiş sürümdür; kod değişikliği için API reposundaki launcher'ı tekrar çalıştır.

Eski `npm run dev` akışı korunur. Docker web aynı portu kullanıyorsa önce API reposunda `docker compose stop api web` çalıştır, backend'i `./run.sh` ile başlat ve burada `npm run dev` kullan.

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
- `/profile`: eğitim durumuna göre profil tamamlama/düzenleme.
- `/manager`: üniversite/bölüm/tag ve eşleşme yönetimi.
- `/admin/tags`: Admin için yeni tag oluşturma.
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

Profil tamamlama, katalog ve Manager katalog paneli uygulanmıştır. Soru yönetimi de uygulanmıştır; topluluk cevapları da uygulanmıştır; doğrulanmış admin cevapları ve kalan panel işlevleri sonraki teslimlerdir. Avatar şu an baş harflerden oluşur; fotoğraf dosyası desteği 9. adımda eklenir.

Profil/katalog mutasyonları merkezi CSRF ve en fazla bir 401 retry kullanır. Network hatasında yazma tekrar edilmez. Kayıt version'ı stale ise form korunur ve yeniden yükleme önerilir. Üniversite/bölüm seçimleri arama ve sayfalama destekler; yalnız ilk sayfanın kayıtlarıyla sınırlı seçim yoktur.

Profil/katalog tarayıcı testleri Docker CLI ve yerel PostgreSQL'e erişim gerektirir. Test, kendisinin oluşturduğu `browser-profile-...@example.test` hesabını DB üzerinden Manager yapar; gerçek kullanıcıların yetkilerini değiştirmez. Varsayılan container `tanidikvar-postgres-1`, DB kullanıcı/adı `tanidikvar`; özelleştirmeler için `E2E_POSTGRES_CONTAINER`, `E2E_DB_USER`, `E2E_DB_NAME` kullanılabilir. Test katalog kayıtları “Test” adıyla oluşturulur ve fiziksel temizleme yapılmaz.

## Soru ekranları

- `/questions`: public, en yeni sorular; kapsam/üniversite/bölüm/tag filtreleri ve sayfalama. Filtreler URL’de taşınır.
- `/questions/new`: giriş/profil ön koşulu, üç kapsam, isteğe bağlı açıklama ve en fazla 5 tag.
- `/questions/:id`: düz metin detay, yayın/düzenleme tarihi; yalnız soru sahibine düzenleme/arşivleme düğmeleri.
- `/questions/:id/edit`: sürüm kontrollü form; 409’da yazılanlar korunur ve açık yeniden yükleme sunulur.
- `/my-questions`: oturum sahibinin aktif ve arşivlenmiş soruları.

Arşivlemeden önce sonucu açıklayan onay gösterilir; arşiv soru bağlantıdan okunur ve düzenlenemez. Yeni gönderim anahtarı form ömrünce korunur; belirsiz ağ hatasından sonra aynı içerikle tekrar deneme ikinci soru oluşturmaz. Değiştirilmiş içerikle aynı anahtar çakışırsa Sorularım’dan önceki kayıt kontrol edilir. Yeni form aynı başlıkla ayrı soru açabilir. HTML/rich-text çalıştırılmaz; kullanıcı içeriği React metni olarak gösterilir.

Yeni tarayıcı senaryosu masaüstü/mobilde profil kapısı, üç soru kapsamı, birleşik filtre, düzenleme, iki sekmede eski sürüm çakışması, arşiv ve anonim okuma akışını gerçek Docker API ile doğrular. Sentetik katalog/soru kayıtları yerel test verisidir; fiziksel silinmez.

## Topluluk cevapları

Soru detayındaki Topluluk cevapları alanı gerçek API’ye bağlıdır. Herkes görünür cevapları ve aktif cevap sayısını okuyabilir; giriş/profil koşulunu sağlayan kullanıcı tek cevabını yayınlar, düzenler, kaldırır veya geri yükler. Düzenlendi bilgisi ve Türkiye saatine göre yayın/düzenleme tarihleri gösterilir; HTML çalıştırılmaz.

Kişinin kendi cevabı public sayfalamadan ayrı yüklenir. Kaldırılmış metin yalnız sahibinin yönetim alanında görünür; oturum değişince bu alan sıfırlanır. Kendi cevap isteği başarısızsa yanlışlıkla yeni cevap formu açılmaz. Form hatasında yazılan metin korunur; sürüm çakışmasında kullanıcı açıkça güncel cevabını yükler. Kaldırma öncesi açıklayıcı onay vardır. Arşivde düzenleme/yeni yayın/geri yükleme kapalı, kaldırma açıktır.

Admin ve Manager katkıları da bu bölümde COMMUNITY kalır; doğrulanmış admin cevabı rozeti verilmez. Bu teslim yeni route veya bağımlılık eklemez. Genel soru kartı sayaçları, beğeni/görüntülenme ve admin cevabı sonraki teslimlerdir.

Mevcut soru tarayıcı senaryosu cevap yayınlama, iki sekmede eski cevap sürümü, kaldırma/geri yükleme, arşivde okuma ve anonim erişim kontrolleriyle genişletildi. Backend gerçek Testcontainers testleri ayrıca tekillik, sahiplik, arşivleme yarışı ve fiziksel silme engelini doğrular.
