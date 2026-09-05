import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from './useAuth'
import { AuthFormError } from './AuthFormError'
import { formError } from './formError'

export function AccountPage() {
  const auth = useAuth()
  const [error, setError] = useState<ApiError | null>(null)
  if (auth.status === 'loading') return <section className="status-page" role="status">Hesabın yükleniyor…</section>
  if (auth.status === 'error') return <section className="status-page"><h1>Hesabına ulaşılamadı.</h1><AuthFormError error={error} /><button className="button" onClick={auth.reload}>Tekrar dene</button></section>
  if (!auth.user) return <Navigate to="/login" replace />
  return <section className="auth-page"><div className="auth-intro"><span className="eyebrow">TANIDIKVAR'A HOŞ GELDİN</span>
    <h1>İyi ki geldin.</h1><p>Üniversiteyi, onu yaşayanlardan tanımaya bir adım daha yakınsın.</p></div>
    <div className="auth-card"><h2>Hesabım</h2><dl><dt>E-posta adresi</dt><dd>{auth.user.email}</dd><dt>Hesap durumu</dt><dd>E-posta doğrulandı</dd></dl>
      <p>{auth.user.profileCompleted?'Profilin tamamlandı.':'Soru sormak ve deneyim paylaşmak için profilini tamamla.'}</p>
      <Link className="button" to="/profile">{auth.user.profileCompleted?'Profilimi düzenle':'Profilini tamamla'}</Link>
      {auth.user.role==='MANAGER' && <Link to="/manager">Manager Panel</Link>}
      {auth.user.role==='ADMIN' && <Link to="/admin/tags">Tag yönetimi</Link>}
      <AuthFormError error={error} /><Link className="button" to="/">Ana sayfaya dön</Link>
      <button className="button button-secondary" onClick={() => { setError(null); void auth.logout().catch(reason => setError(formError(reason))) }}>Çıkış yap</button>
    </div></section>
}
