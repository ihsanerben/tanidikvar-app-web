# Manager ekranlarının kaynağı

Bu dizindeki sayfa ve bileşenler, kullanıcının eski Manager tasarımını doğrudan taşıma talebi doğrultusunda web reposundaki `src/features/management`, `src/features/applications` ve `src/features/catalog` kaynaklarından kopyalandı. İlgili form, profil, katalog seçici ve hata bileşenleri de aynı görünümü korumak için taşındı.

- `pages.tsx`: Next.js istemci sınırı; `/yonetim` sayfalarının tamamı buradaki ekranları kullanır.
- `navigation.tsx`: Eski bağlantıları Next.js route'larına ve navigation API'sine uyarlar. React Router bağımlılığı yoktur.
- `session-provider.tsx`: Sunucuda doğrulanan Manager kimliğini taşınan ekranlara verir. Yetki denetimi `/yonetim/layout.tsx` ve Spring API'dedir.
- `api/apiClient.ts`: Eski yapılandırılmış hata, CSRF, gerekçe ve sürüm kontrolü davranışını koruyarak istekleri aynı origin'deki `/api/backend` üzerinden iletir. Tarihsel başvuru/yetki kaldırma yollarını güncel Tanıdık endpoint'lerine çevirir.
- `manager.css`: Eski `src/styles.css` kurallarının Manager kabuğuna kapsamlandırılmış kopyasıdır; public sayfalara uygulanmaz.
- `additions.css`: Yeni mezun doğrulaması ve üniversite tema düzenleyicisinin uyumu ile mevcut global CSS'ten gelen çakışmaların düzeltmeleridir.

Arayüzde Tanıdık adı kullanılır. Tarihsel audit anahtarları ve API sayaç adları korunur. Toplu katalog/tag ekleme, kullanıcı ve soru/yorum detayları, gerekçeli düzenleme/gizleme, başvuru geçmişi ve analitik veri tablosu eski ekranlardan taşınmıştır.

## Doğrulama

`next-app` dizininde `npm run build`, ardından `node scripts/check-manager.mjs` çalıştırılır. Kontrol, eski Vite ve yeni Next.js uygulamalarını aynı geçici örnek API ile açar; 15 ekranı 1440 ve 390 piksel genişliklerinde dolaşır, ekran görüntülerini ve ölçüm raporunu işletim sisteminin geçici dizinine yazar. Gerçek veritabanına bağlanmaz. Filtre, modal kapatma ve mobil menü klavye davranışları ayrıca kontrol edilir.

`scripts/port-manager.mjs` ilk kopyalama için kullanılan patch üreticisidir. İlk kopyadan sonra yapılan Next.js/API uyarlamalarını içermez; güncel dosyaların üzerine yeniden uygulanmamalıdır.
