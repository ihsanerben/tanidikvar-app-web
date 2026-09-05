import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { login, register } from './authApi'
import { useAuth } from './useAuth'
import { AuthFormError } from './AuthFormError'
import { formError } from './formError'

export function CredentialsPage({ mode }: { mode: 'login' | 'register' }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const isRegister = mode === 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const submitting = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  if (auth.user) return <Navigate to="/account" replace />
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setPending(true); setError(null)
    try {
      if (isRegister) { await register(email.trim(), password); setPassword(''); setSent(true) }
      else { const user = await login(email.trim(), password); auth.setUser(user); setPassword(''); navigate('/account', { replace: true }) }
    } catch (reason) {
      setError(formError(reason))
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus())
    } finally { submitting.current = false; setPending(false) }
  }
  return <section className="auth-page"><div className="auth-intro"><span className="eyebrow">BİR TANIDIĞIN OLSUN</span>
    <h1>{sent ? 'E-postanı kontrol et.' : isRegister ? 'Aramıza katıl.' : 'Tekrar hoş geldin.'}</h1>
    <p>{sent ? 'Adresin kayıt için uygunsa doğrulama bağlantısını göndereceğiz. Bağlantı 24 saat geçerli.' : isRegister
      ? 'Üniversite deneyimlerine bir adım daha yaklaş. Başlamak için e-posta adresin yeterli.'
      : 'Hesabına giriş yap, kaldığın yerden devam et.'}</p></div>
    {sent ? <div className="auth-card"><p>Gelen kutunu ve spam klasörünü kontrol et. Zaten hesabın varsa giriş yapabilirsin.</p>
      <Link className="button" to="/login">Giriş yap</Link><Link to="/resend-verification">Doğrulama bağlantısını yeniden iste</Link></div>
      : <form className="auth-card" onSubmit={submit} ref={form}>
        <label htmlFor="email">E-posta adresi</label><input id="email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={event => setEmail(event.target.value)} aria-invalid={!!error?.fieldErrors.email} aria-describedby={error?.fieldErrors.email ? 'email-error' : undefined} />
        {error?.fieldErrors.email && <p className="field-error" id="email-error">{error.fieldErrors.email}</p>}
        <label htmlFor="password">Şifre</label><input id="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'}
          required minLength={isRegister ? 10 : undefined} maxLength={72} value={password} onChange={event => setPassword(event.target.value)}
          aria-invalid={!!error?.fieldErrors.password} aria-describedby="password-help" />
        <p className={error?.fieldErrors.password ? 'field-error' : 'field-help'} id="password-help">{error?.fieldErrors.password ?? (isRegister ? 'En az 10 karakter kullan.' : 'Şifreni kimseyle paylaşma.')}</p>
        <AuthFormError error={error} />
        {error?.code === 'EMAIL_UNVERIFIED' && <Link to="/resend-verification">Doğrulama bağlantısı iste</Link>}
        <button className="button" disabled={pending}>{pending ? 'Lütfen bekle…' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}</button>
        {!isRegister && <Link to="/forgot-password">Şifremi unuttum</Link>}
        <p className="auth-switch">{isRegister ? 'Zaten hesabın var mı?' : 'Henüz hesabın yok mu?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Giriş yap' : 'Kayıt ol'}</Link></p>
      </form>}
  </section>
}
