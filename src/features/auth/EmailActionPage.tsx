import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { requestMail, verifyEmail, resetPassword } from './authApi'
import { AuthFormError } from './AuthFormError'
import { formError } from './formError'
import { useAuth } from './useAuth'

type Mode = 'verify' | 'resend' | 'forgot' | 'reset'
const titles: Record<Mode, string> = { verify: 'E-postanı doğrula.', resend: 'Yeni doğrulama bağlantısı.', forgot: 'Şifreni mi unuttun?', reset: 'Yeni şifreni belirle.' }
export function EmailActionPage({ mode }: { mode: Mode }) {
  const auth = useAuth()
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const submitting = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const needsEmail = mode === 'forgot' || mode === 'resend'
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true; setPending(true); setError(null)
    try {
      if (needsEmail) await requestMail(email.trim(), mode === 'forgot' ? 'password' : 'verification')
      else if (mode === 'verify') await verifyEmail(token)
      else { await resetPassword(token, password); auth.setUser(null); setPassword('') }
      if (!needsEmail) window.history.replaceState(null, '', window.location.pathname)
      setDone(true)
    } catch (reason) {
      setError(formError(reason))
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus())
    } finally { submitting.current = false; setPending(false) }
  }
  return <section className="auth-page"><div className="auth-intro">
    <h1>{done ? needsEmail ? 'E-postanı kontrol et.' : mode === 'verify' ? 'E-postan doğrulandı.' : 'Şifren yenilendi.' : titles[mode]}</h1>
</div>
    {done ? <div className="auth-card"><Link className="button" to="/login">Giriş yap</Link></div>
      : !needsEmail && !token ? <div className="auth-card"><p role="alert">E-postandaki bağlantıyı aç veya yeni bağlantı iste.</p><Link to={mode === 'verify' ? '/resend-verification' : '/forgot-password'}>Yeni bağlantı iste</Link></div>
      : <form className="auth-card" onSubmit={submit} ref={form}>
        {needsEmail && <><label htmlFor="email">E-posta adresi</label><input id="email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={event => setEmail(event.target.value)} aria-invalid={!!error?.fieldErrors.email} aria-describedby={error?.fieldErrors.email ? 'email-error' : undefined} />
          {error?.fieldErrors.email && <p id="email-error" className="field-error">{error.fieldErrors.email}</p>}</>}
        {mode === 'reset' && <><label htmlFor="password">Yeni şifre</label><input id="password" type="password" autoComplete="new-password" required minLength={10} maxLength={72}
          value={password} onChange={event => setPassword(event.target.value)} aria-invalid={!!error?.fieldErrors.password} aria-describedby={error?.fieldErrors.password?'password-help':undefined} />
          {error?.fieldErrors.password&&<p id="password-help" className="field-error">{error.fieldErrors.password}</p>}</>}
        <AuthFormError error={error} />
        <button className="button" disabled={pending}>{pending ? 'Lütfen bekle…' : needsEmail ? 'Bağlantı gönder' : mode === 'verify' ? 'E-postamı doğrula' : 'Şifremi yenile'}</button>
        {error?.code === 'INVALID_ACTION_TOKEN' && <Link to={mode === 'verify' ? '/resend-verification' : '/forgot-password'}>Yeni bağlantı iste</Link>}
        <Link to="/login">Girişe dön</Link>
      </form>}
  </section>
}
