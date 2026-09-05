import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
export function QuestionGate({children,profile=true}:{children:ReactNode;profile?:boolean}) {
  const auth=useAuth()
  if(auth.status==='loading')return <section className="status-page" role="status">Hesabın yükleniyor…</section>
  if(auth.status==='error')return <section className="status-page"><h1>Hesabına ulaşılamadı.</h1><button className="button" onClick={auth.reload}>Tekrar dene</button></section>
  if(!auth.user)return <section className="status-page"><h1>Önce giriş yap.</h1><p>Soruları herkes okuyabilir. Kendi sorunu paylaşmak için hesabına giriş yap.</p><Link className="button" to="/login">Giriş yap</Link></section>
  if(profile && !auth.user.profileCompleted)return <section className="status-page"><h1>Önce profilini tamamla.</h1><Link className="button" to="/profile">Profilini tamamla</Link></section>
  return children
}
