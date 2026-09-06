import type { Opening } from './opening'
import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { getStatistics,getLike,setLike,type Statistics,type Like } from './engagementApi'
import { QuestionStats } from './QuestionStats'
export function QuestionEngagement({questionId,initial,archived,opening,answersRevision}:{questionId:string;initial:Statistics;archived:boolean;opening:Opening;answersRevision:number}) {
 const auth=useAuth(),[stats,updateStats]=useState(initial),[revision,refresh]=useState(0),[viewAttempt,retryView]=useState(0)
 const [error,setError]=useState<ApiError|null>(null),[viewError,setViewError]=useState<ApiError|null>(null)
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
  getStatistics(questionId,controller.signal).then(s=>{if(!controller.signal.aborted){updateStats(s);setError(null)}}).catch(e=>{if(!controller.signal.aborted)setError(formError(e))})
  return ()=>controller.abort()
 },[questionId,revision,answersRevision])
 return <section className="question-engagement" aria-label="Soru etkileşimleri"><QuestionStats statistics={stats}/>
 {error&&<div><p role="alert">Sayaçlar güncellenemedi.</p><button onClick={()=>refresh(r=>r+1)}>Sayaçları yenile</button></div>}
 {viewError&&<div><p role="alert">Görüntülenme kaydedilemedi.</p><button onClick={()=>{opening.retry();setViewError(null);retryView(r=>r+1)}}>Görüntülenmeyi tekrar kaydet</button></div>}
 {auth.status==='loading'?<p role="status">Beğeni durumu yükleniyor…</p>:auth.status==='error'?<button onClick={auth.reload}>Beğenmek için hesabı tekrar yükle</button>:!auth.user?<p><Link to="/login">Beğenmek için giriş yap</Link></p>:!auth.user.profileCompleted?<p><Link to="/profile">Beğenmek için profilini tamamla</Link></p>:
 <LikeControl key={questionId+auth.user.id+auth.user.role+auth.user.profileCompleted} questionId={questionId} archived={archived} changed={()=>refresh(r=>r+1)}/>}
 </section>
}
function LikeControl({questionId,archived,changed}:{questionId:string;archived:boolean;changed:()=>void}) {
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
 return <div className="question-like"><AuthFormError error={error}/>{value&&<button className="like-toggle" aria-label={value.liked?'Beğeniyi geri al':'Beğen'} title={value.liked?'Beğeniyi geri al':'Beğen'} aria-pressed={value.liked} disabled={pending||!!error||(archived&&!value.liked)} onClick={()=>void toggle()}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill={value.liked?'currentColor':'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg></button>}
 {!value&&!error&&<p role="status">Beğeni durumu yükleniyor…</p>}{error&&<button disabled={pending} onClick={()=>{reload(r=>r+1);changed()}}>Beğeni durumunu yenile</button>}</div>
}
