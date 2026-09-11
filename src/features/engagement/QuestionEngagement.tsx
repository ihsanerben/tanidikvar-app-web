import type { Opening } from './opening'
import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { getStatistics,getLike,setLike,type Statistics,type Like } from './engagementApi'
import { QuestionStats } from './QuestionStats'
import type { ReactNode } from 'react'
export function QuestionEngagement({questionId,initial,archived,opening,answersRevision,onStatistics,onComment,children}:{questionId:string;initial:Statistics;archived:boolean;opening:Opening;answersRevision:number;onStatistics?:(statistics:Statistics)=>void;onComment?:()=>void;children?:ReactNode}) {
 const auth=useAuth(),[stats,updateStats]=useState(initial),[revision,refresh]=useState(0),[viewAttempt,retryView]=useState(0)
 const [shareOpen,setShareOpen]=useState(false),[shareMessage,setShareMessage]=useState('')
 const [error,setError]=useState<ApiError|null>(null),[viewError,setViewError]=useState<ApiError|null>(null)
 const canLike=!!auth.user?.profileCompleted&&auth.user.role!=='MANAGER'
 const canComment=!!auth.user?.profileCompleted&&!archived
 useEffect(()=>{
  let active=true,started=false
  function visible(){
   if(document.visibilityState!=='visible'||started)return
   started=true
   opening.record(questionId).then(()=>{if(active){setViewError(null);refresh(r=>r+1)}}).catch(e=>{if(active)setViewError(formError(e))})
  }
  visible();document.addEventListener('visibilitychange',visible)
  return ()=>{active=false;document.removeEventListener('visibilitychange',visible)}
 },[questionId,opening,viewAttempt])
 useEffect(()=>{
  const controller=new AbortController()
  getStatistics(questionId,controller.signal).then(s=>{if(!controller.signal.aborted){updateStats(s);onStatistics?.(s);setError(null)}}).catch(e=>{if(!controller.signal.aborted)setError(formError(e))})
  return ()=>controller.abort()
 },[questionId,revision,answersRevision,onStatistics])
 return <section className="question-engagement" aria-label="Soru etkileşimleri"><QuestionStats statistics={stats} hideLikes={canLike} hideComments={canComment}/>
 {canLike&&<LikeControl
  key={questionId+auth.user!.id}
  questionId={questionId}
  archived={archived}
  count={stats.likeCount}
  changed={()=>refresh(r=>r+1)}
 />}
 {canComment&&<button type="button" className="engagement-icon-button" aria-label="Yorum yap" title="Yorum yap" onClick={onComment}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H8l-4 4V4Z"/></svg><span aria-hidden="true">{stats.totalAnswerCount.toLocaleString('tr-TR')}</span><span className="visually-hidden">{stats.totalAnswerCount.toLocaleString('tr-TR')} yorum</span></button>}
 <button type="button" className="engagement-icon-button" aria-label="Soruyu paylaş" title="Soruyu paylaş" aria-expanded={shareOpen} onClick={()=>{setShareOpen(v=>!v);setShareMessage('')}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7.5 18-3-7.5L3 10.5 21 3Z"/><path d="m10.5 13.5 4-4"/></svg></button>
 {children}
 {shareOpen&&<div className="share-link"><input aria-label="Paylaşım bağlantısı" readOnly value={window.location.href}/><button type="button" onClick={()=>void navigator.clipboard?.writeText(window.location.href).then(()=>setShareMessage('Bağlantı kopyalandı.'))}>Kopyala</button>{shareMessage&&<span role="status">{shareMessage}</span>}</div>}
 {error&&<div><p role="alert">Sayaçlar güncellenemedi.</p><button onClick={()=>refresh(r=>r+1)}>Sayaçları yenile</button></div>}
 {viewError&&<div><p role="alert">Görüntülenme kaydedilemedi.</p><button onClick={()=>{opening.retry();setViewError(null);retryView(r=>r+1)}}>Görüntülenmeyi tekrar kaydet</button></div>}
 {auth.status==='loading'?<p role="status">Beğeni durumu yükleniyor…</p>:auth.status==='error'?<button onClick={auth.reload}>Beğenmek için hesabı tekrar yükle</button>:!auth.user?<p><Link to="/login">Beğenmek için giriş yap</Link></p>:!auth.user.profileCompleted?<p><Link to="/profile">Beğenmek için profilini tamamla</Link></p>:
    null}
 </section>
}
function LikeControl({questionId,archived,count,changed}:{questionId:string;archived:boolean;count:number;changed:()=>void}) {
 const [value,setValue]=useState<Like|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,reload]=useState(0),[pending,setPending]=useState(false)
 const busy=useRef(false),mounted=useRef(true)
 useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false}},[])
 useEffect(()=>{const controller=new AbortController();getLike(questionId,controller.signal).then(v=>{if(!controller.signal.aborted){setValue(v);setError(null)}}).catch(e=>{if(!controller.signal.aborted)setError(formError(e))});return ()=>controller.abort()},[questionId,revision])
 async function toggle(){
  if(!value||busy.current)return;busy.current=true;setPending(true);setError(null)
  try{const next=await setLike(questionId,{liked:!value.liked,version:value.version});if(mounted.current){setValue(next);changed()}}
  catch(e){if(mounted.current)setError(formError(e))}
  finally{busy.current=false;if(mounted.current)setPending(false)}
 }
 return <div className="question-like"><AuthFormError error={error}/>{value&&<button className="like-toggle" aria-label={value.liked?'Beğeniyi geri al':'Beğen'} title={value.liked?'Beğeniyi geri al':'Beğen'} aria-pressed={value.liked} disabled={pending||!!error||(archived&&!value.liked)} onMouseDown={e=>e.preventDefault()} onClick={()=>void toggle()}><svg viewBox="0 0 24 24" aria-hidden="true" fill={value.liked?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg><span aria-hidden="true">{count.toLocaleString('tr-TR')}</span><span className="visually-hidden">{count.toLocaleString('tr-TR')} beğeni</span><span className="visually-hidden">{pending?'İşleniyor…':value.liked?'Beğenildi':'Beğen'}</span></button>}
 {!value&&!error&&<p role="status">Beğeni durumu yükleniyor…</p>}{error&&<button disabled={pending} onClick={()=>{reload(r=>r+1);changed()}}>Beğeni durumunu yenile</button>}</div>
}
