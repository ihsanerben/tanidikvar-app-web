import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AnswerList } from './AnswerList'
import { OwnAnswer } from './OwnAnswer'
export function AnswerSection({questionId,archived,reloadQuestion}:{questionId:string;archived:boolean;reloadQuestion:()=>void}) {
  const auth=useAuth(),[revision,setRevision]=useState(0)
  return <section className="answer-section" aria-labelledby="community-heading"><div className="answer-heading"><span className="eyebrow">BİRLİKTE ÖĞRENELİM</span><h2 id="community-heading">Topluluk cevapları</h2><p>Bu bölümdeki katkılar kullanıcıların kendi deneyim ve görüşleridir.</p></div>
    {auth.status==='loading'?<p role="status">Hesabın yükleniyor…</p>:auth.status==='error'?<div><p>Hesap bilgilerin alınamadı.</p><button onClick={auth.reload}>Hesabımı tekrar kontrol et</button></div>:auth.user?
      <OwnAnswer key={`${questionId}:${auth.user.id}`} questionId={questionId} archived={archived} onChange={()=>setRevision(r=>r+1)} reloadQuestion={reloadQuestion}/>:
      !archived && <p className="answer-login">Sen de katkı vermek ister misin? <Link to="/login">Giriş yap</Link> veya <Link to="/register">kayıt ol</Link>.</p>}
    <AnswerList key={questionId} questionId={questionId} revision={revision}/>
  </section>
}
