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

Profil tamamlama, katalog ve Manager katalog paneli uygulanmıştır. Soru yönetimi de uygulanmıştır; topluluk cevapları da uygulanmıştır; doğrulanmış Admin cevapları ve Admin katkı paneli de uygulanmıştır; kalan Manager/panel işlevleri sonraki teslimlerdir. Tamamlanmış profil ekranında fotoğraf yükleme/kaldırma vardır; fotoğrafsız sunumlarda baş harf avatarı kullanılabilir.

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


## Admin başvuruları ve fotoğraf

`/applications`: kendi başvuru geçmişin, ret gerekçesi ve yeni/yeniden doğrulama başvurusu. Profil bilgileri gönderim öncesi gösterilir; PDF ile tek gönderimde kaydedilir. Gönderilen bilgiler değişmez. Aynı anda tek bekleyen başvuru olabilir; ret sonrası yeni belgeyle başvurulur. Eski onay ile güncel doğrulama ayrı gösterilir.

`/manager/applications`: durum filtresi ve sayfalı başvurular, özel belge indirme, kabul/ret ve Admin yetkisi kaldırma. Karar öncesi açık onay vardır; ret/yetki kaldırmada gerekçe zorunlu. Yetki kaldırma bekleyen yeniden doğrulamayı da kapatır. Eski sürüm çakışmasında form korunur ve listeyi yenileme sunulur. Hesabım ve Manager katalog panelinden erişilir.

`/profile`: tamamlanmış profil için JPEG/PNG yükleme, fotoğrafı değiştirme/kaldırma. Fotoğraf en fazla 5 MB, belge PDF en fazla 10 MB. Dosya doğrulaması backend'dedir. Fotoğraf herkese açıktır; resmi belgeyi yalnız sahibi ve Manager indirebilir. Kaldırılan/değiştirilen dosya fiziksel silinmez, eski erişim kapanır.

Merkezi client multipart gönderiminde Content-Type boundary değerini tarayıcıya bırakır; aynı cookie/CSRF ve tek 401 yenileme davranışı kullanılır. Belge indirmede geçici Blob URL oluşturulup bırakılır. Belirsiz ağ hatasında başvuru yeniden gönderilirse formdaki aynı requestId korunur; otomatik yazma tekrarı yoktur.

`npm test`: 52 test. Yeni testler multipart/CSRF, ağ hatasında aynı gönderim anahtarı, profil kapısı, Manager karar onayı/stale form, yetki kaldırma açıklaması ve avatar kaldırmayı doğrular. `npm run lint` ve `npm run build` başarılıdır.

Tarayıcı paketinde toplam 14 senaryo vardır (7 masaüstü + 7 mobil). Başvuru senaryosu iki sentetik hesapla özel PDF indirme, ret/yeniden başvuru, onay, bekleyen yeniden doğrulamada yetki kaldırma ve fotoğraf erişim yaşam döngüsünü test eder. Toplu testler auth IP sınırını aşabileceği için projeleri ayrı çalıştır:

```bash
npm run test:e2e -- --project=desktop
npm run test:e2e -- --project=mobile
```

İki çalıştırma arasında auth limit penceresinin dolmasını bekle veya yalnız yerel test ortamında API reposundan `docker compose restart api` ve ardından `docker compose --profile app up -d --wait api` çalıştır. Bu, bellek içi auth sayacını sıfırlar; PostgreSQL ve dosya volume verilerini silmez. Uygulamadaki auth sınırları test için düşürülmedi.


## Admin cevapları ve profil

`/admin`: kalan günlük hak, cevaplayacakların, kendi Admin cevapların, profil ve soru yönetimi bağlantıları. Üniversite/bölüm bağlantıları mevcut soru filtrelerini açar; keşif ekranında tag seçimi de yapılabilir. Eski Admin kendi geçmişini okuyup soru üzerinden cevabını kaldırabilir.

Soru detayında ayrı **Admin Cevapları** bölümü vardır. “Cevaplayacağım” ile atan, sonra cevabını yayımla. Atama iptali cevabı değiştirmez. Günlük beş farklı soru hakkı yalnız ilk yayında tüketilir. Düzenleme ve geri yükleme yeni hak tüketmez; geri yükleme aktif atama ister. Arşivde yalnız kaldırma yapılabilir. Ret/yeniden doğrulama geçmişi ilk yayın eğitim bilgisini değiştirmez.

`/admins/:id`: fotoğraf, doğrulanmış eğitim, güncel kişisel beyan, görünür cevap sayısı ve soru/cevap geçmişi. Cevaplar ilk yayın doğrulamasını taşır. Yetkisi kaldırılan kişi “Artık Admin değil” olarak gösterilir. Public DTO resmi belge/ret bilgisi içermez.

10. adımda 62 frontend testi, lint/build geçti. Tarayıcı başvuru senaryosu Admin yayını/düzenleme/restore, public profil/panel ve yetki kaldırmadan sonraki yönetimle genişletildi; hesap sayısı artırılmadı. API testleri ayrıca kota ve gerçek eşzamanlılığı doğrular.


## Soru etkileşimleri

Soru kartları ve detayları toplam görüntülenme, beğeni, topluluk/Admin cevapları ve toplam cevap sayısını gösterir. Kart sayaçları liste yanıtından gelir; kart başına HTTP isteği yapılmaz. Profilini tamamlamış hesap Beğen / Beğeniyi geri al düğmesiyle kendi durumunu yönetir. Sürüm çakışmasında açık yenileme sunulur; hesap değişiminde önceki kişinin beğeni durumu kaldırılır. Arşivde yeni beğeni kapalı, geri alma açıktır.

Her görünür detay açılışı yeni UUID üretir. Yenileme/yeni sekme/yeniden navigasyon sayılır; aynı açılışın StrictMode, cevap güncellemesi, arşiv sonrası veri yüklemesi ve ağ tekrarı ikinci kayıt oluşturmaz. Arka planda açılan sekme ilk görünür olduğunda sayılır. Görüntülenme başarısız olursa aynı açılış kimliğiyle tekrar deneme vardır. GET/prefetch kendi başına görüntülenme yazmaz.

Merkezi `apiPublicPost`, hesaba bağlı olmayan görüntülenmeler için CSRF ve cookie kilidini korur; anonim oturum kontrolü bu olayı iptal etmez. Public yazma otomatik refresh veya ağ retry yapmaz. Hesaba bağlı mutasyonların oturum değişimi kontrolü korunur. Cevap/beğeni değişiminden sonra yalnız sayaçlar yenilenir; diğer cevap taslakları sıfırlanmaz.

11. adımda 71 frontend testi ve lint geçti. Docker üretim derlemesi TypeScript kontrolünü de içerir. Yeni testler anonim görünürlük/StrictMode, aynı kimlikle tekrar, beğeni/geri alma, profil/hesap değişimi, stale durum, arşiv ve sayaç doğrulamasını kapsar.

Gerçek Docker API ile 14 masaüstü/mobil senaryo doğrulandı. Soru senaryosunda beğeni/geri alma, cevap toplamları, GET’in görüntülenme yazmaması, sayfa yenileme ve anonim arşiv okuması vardır. Masaüstü/mobil sayaç ekran görüntüleri incelendi.
