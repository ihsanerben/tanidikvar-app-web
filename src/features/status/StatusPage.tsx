import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth } from './healthApi'

type Status = 'loading' | 'ready' | 'error'

export function StatusPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    getHealth(controller.signal)
      .then(() => { if (!controller.signal.aborted) setStatus('ready') })
      .catch(() => { if (!cancelled) setStatus('error') })
      .finally(() => window.clearTimeout(timeout))
    return () => { cancelled = true; controller.abort(); window.clearTimeout(timeout) }
  }, [attempt])
  return <section className="status-page">

    <h1>Sistem durumu</h1>
    <div className="status-card" role="status" aria-live="polite">
      <span className={`status-dot ${status}`} aria-hidden="true" />
      {status === 'loading' && <p>Bağlantı kontrol ediliyor…</p>}
      {status === 'ready' && <div><h2>Bağlantı hazır</h2><p>Uygulama ve veritabanı yanıt veriyor.</p></div>}
      {status === 'error' && <div><h2>Şu anda bağlantı kurulamıyor</h2><p>Biraz sonra tekrar deneyebilirsin.</p></div>}
    </div>
    <button className="button" disabled={status === 'loading'} onClick={() => { setStatus('loading'); setAttempt(attempt + 1) }}>Tekrar kontrol et</button>
    <Link className="text-link" to="/">Ana sayfaya dön →</Link>
  </section>
}
