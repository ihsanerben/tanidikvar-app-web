import { Link, Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { StatusPage } from '../features/status/StatusPage'

export function App() {
  return <>
    <a className="skip-link" href="#main">İçeriğe geç</a>
    <header className="site-header"><Link className="brand" to="/" aria-label="TanıdıkVar ana sayfa"><span className="brand-mark" aria-hidden="true">t.</span>tanıdık<span>var</span></Link><span className="header-note">Üniversiteyi, içinden öğren.</span><span className="launch-badge">Yakında burada</span></header>
    <main id="main"><Routes><Route path="/" element={<HomePage />} /><Route path="/durum" element={<StatusPage />} /><Route path="*" element={<section className="status-page"><span className="eyebrow">404</span><h1>Bu sayfayı bulamadık.</h1><Link className="button" to="/">Ana sayfaya dön</Link></section>} /></Routes></main>
    <footer className="site-footer"><Link className="brand footer-brand" to="/">tanıdık<span>var</span></Link><p>Tercihler değişir, deneyimler yol gösterir.</p><Link to="/durum">Sistem durumu ↗</Link></footer>
  </>
}
