export function HomePage() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><span className="small-dot" /> YENİ BİR BAŞLANGIÇ · YAKINDA</span>
        <h1>Tercih yolunda<br />bir <em>tanıdığın</em><br />olsun.</h1>
        <p className="hero-description">Bir bölümü en iyi, o sıralardan geçenler anlatır. Üniversite öğrencilerinin ve mezunların deneyimleriyle kendi yolunu bul.</p>
        <a className="button" href="#nasil-calisir">TanıdıkVar’ı keşfet <span aria-hidden="true">↗</span></a>
        <p className="hero-note">Gerçek insanlar. Birinci elden deneyimler.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-grid" />
        <div className="art-heading">BİR SORU, YENİ BİR BAKIŞ AÇISI.</div>
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="speech speech-ask"><span>AKLINDAKİ SORU</span><strong>Benim için<br />doğru bölüm<br />hangisi?</strong><i>?</i></div>
        <div className="speech speech-answer"><div className="avatar-stack"><b>ö</b><b>m</b><b>+</b></div><strong>Bir de burada<br />okuyanlara sor.</strong><span>ÖĞRENCİLER & MEZUNLAR</span></div>
        <span className="art-star">✳</span><span className="art-caption">Senin yolun, onların deneyimi.</span>
      </div>
    </section>
    <section id="nasil-calisir" className="how-section">
      <div className="section-heading"><span className="eyebrow">NASIL BİR YER OLACAK?</span><h2>Broşürlerin ötesinde,<br />kampüsün içinden.</h2><p>TanıdıkVar hazırlanıyor. Tercih döneminde aradığın deneyimleri tek bir yerde buluşturacağız.</p></div>
      <div className="feature-grid">
        <article><span className="feature-number">01 / KEŞFET</span><h3>Merak ettiğin yeri bul.</h3><p>Üniversite, bölüm ve konular üzerinden sana yakın sorulara ulaş.</p><span className="feature-symbol" aria-hidden="true">↗</span></article>
        <article><span className="feature-number">02 / DİNLE</span><h3>Yaşayanlardan öğren.</h3><p>Doğrulanmış öğrencilerin ve mezunların cevaplarıyla farklı bakış açılarını keşfet.</p><span className="feature-symbol" aria-hidden="true">≋</span></article>
        <article><span className="feature-number">03 / SOR</span><h3>Sorun cevapsız kalmasın.</h3><p>Kampüs hayatından derslere, hazırlıktan iş hayatına kadar merak ettiklerini paylaş.</p><span className="feature-symbol" aria-hidden="true">?</span></article>
      </div>
    </section>
    <section className="closing"><span className="eyebrow">BİRLİKTE DAHA KOLAY</span><h2>Birinin deneyimi,<br />senin başlangıcın olabilir.</h2><p>Soru sormanın ve deneyim paylaşmanın buluşma noktası.</p></section>
  </>
}
