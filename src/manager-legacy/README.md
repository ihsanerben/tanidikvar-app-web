# Manager ekranlarının kaynağı

Bu dizindeki sayfa ve bileşenler, kullanıcının korumayı seçtiği Manager tasarımını Next.js içinde sürdürür. İlgili form, profil, katalog seçici ve hata bileşenleri aynı görünümü korumak için bu sınırda tutulur.

- `pages.tsx`: Next.js istemci sınırı; `/yonetim` sayfalarının tamamı buradaki ekranları kullanır.
- `navigation.tsx`: Manager bağlantılarını Next.js route'larına ve navigation API'sine uyarlar.
- `session-provider.tsx`: Sunucuda doğrulanan Manager kimliğini taşınan ekranlara verir. Yetki denetimi `/yonetim/layout.tsx` ve Spring API'dedir.
- `api/apiClient.ts`: Yapılandırılmış hata, CSRF, gerekçe ve sürüm kontrolü davranışını koruyarak istekleri aynı origin'deki `/api/backend` üzerinden iletir. Tarihsel başvuru/yetki kaldırma yollarını güncel Tanıdık endpoint'lerine çevirir.
- `manager.css`: Manager kabuğuna kapsamlandırılmış stillerdir; public sayfalara uygulanmaz.
- `additions.css`: Yeni mezun doğrulaması ve üniversite tema düzenleyicisinin uyumu ile mevcut global CSS'ten gelen çakışmaların düzeltmeleridir.

Arayüzde Tanıdık adı kullanılır. Tarihsel audit anahtarları ve API sayaç adları korunur. Toplu katalog/tag ekleme, kullanıcı ve soru/yorum detayları, gerekçeli düzenleme/gizleme, başvuru geçmişi ve analitik veri tablosu eski ekranlardan taşınmıştır.

## Doğrulama

Web repo kökünde `npm run typecheck`, `npm run build` ve `npm run test:session` çalıştırılır. Manager ekranları gerçek API ile staging smoke ve tarayıcı kabul kontrollerine dahil edilir.
