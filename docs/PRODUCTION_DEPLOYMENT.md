# Next.js production deployment

Bu repo Vercel'e tek bir Next.js projesi olarak deploy edilir. Vercel proje kökü doğrudan repo kökü olmalıdır; alt dizin veya özel output directory kullanılmaz.

## Vercel ayarları

1. GitHub reposunu Vercel'e bağla ve framework olarak Next.js kullan.
2. Build komutu `npm run build`, install komutu `npm install` olarak kalabilir.
3. Production ortamına `API_BASE_URL=https://api.tanidikvar.online` ve canonical domain'i içeren `NEXT_PUBLIC_SITE_URL` değişkenlerini ekle.
4. API sağlıklı olduktan sonra deploy et. API tarafındaki `FRONTEND_URL` ve `CORS_ALLOWED_ORIGIN` değerleri canonical web adresini göstermelidir.

Tarayıcı istekleri `/api/backend/...` route handler'ı üzerinden sunucu tarafında API'ye iletilir. Böylece API origin'i istemci paketine gömülmez ve oturum cookie/CSRF davranışı aynı origin üzerinde korunur.

Deploy sonrası API health, giriş, katalog, program detayları ve Manager senkron durumu production adresinden doğrulanmalıdır.
