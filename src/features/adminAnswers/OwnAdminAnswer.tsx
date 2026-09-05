import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { useAuth } from '../auth/useAuth'
import type { ApiError } from '../../api/apiClient'
import { getOwn,getQuota,assign,setStatus,type OwnAdminAnswer as Own,type Quota } from './adminAnswerApi'
import { AdminAnswerEditor } from './AdminAnswerEditor'
export function OwnAdminAnswer({questionId,archived,reload}:{questionId:string;archived:boolean;reload:()=>void}){
 const auth=useAuth(),[data,setData]=useState<{own:Own;quota:Quota}|null>(null),[error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false),[editing,setEditing]=useState(false),[confirm,setConfirm]=useState(false)
 useEffect(()=>{const c=new AbortController();Promise.all([getOwn(questionId,c.signal),getQuota(c.signal)]).then(([own,quota])=>{if(!c.signal.aborted)setData({own,quota})}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[questionId])
 async function action(fn:()=>Promise<unknown>){if(pending)return;setPending(true);setError(null);try{await fn();reload()}catch(e){setError(formError(e))}finally{setPending(false)}}
 if(!data)return error?<div><AuthFormError error={error}/><button onClick={reload}>Admin bilgilerini yeniden yükle</button></div>:<p role="status">Kendi Admin katkın kontrol ediliyor…</p>
 const {own,quota}=data,a=own.answer,active=quota.activeAdmin
 if(!active&&!a&&!own.assignment.assigned)return null
 if(!auth.user?.profileCompleted)return <p>Katkını yönetmek için <Link to="/profile">profilini tamamla</Link>.</p>
 return <div className="own-answer"><h3>Admin katkın</h3>{active?<p role="status">Kalan cevap hakkın: {quota.remaining} / {quota.limit} · Türkiye saatiyle gece yarısında yenilenir.</p>:<p>Artık Admin değilsin. Eski cevabını kaldırabilirsin.</p>}
 <AuthFormError error={error}/>{error&&<button onClick={reload}>Güncel Admin bilgilerini yükle</button>}
 <div className="answer-actions">{active&&!archived&&!own.assignment.assigned&&<button className="button" disabled={pending} onClick={()=>void action(()=>assign(own.assignment,true))}>Cevaplayacağım</button>}
 {own.assignment.assigned&&<><span>Bu soru cevaplayacakların arasında.</span><button disabled={pending} onClick={()=>void action(()=>assign(own.assignment,false))}>Atamayı iptal et</button></>}</div>
 {a?.moderatedAt&&<p role="status">Admin cevabın Manager tarafından gizlendi. Düzenleme ve geri yükleme kapalıdır.</p>}
 {a?.deletedAt&&<><p className="answer-body">{a.body}</p><p>Admin cevabını kaldırdın.</p>{active&&!archived&&!a.moderatedAt&&own.assignment.assigned&&<button className="button" disabled={pending} onClick={()=>void action(()=>setStatus(a,false))}>Admin cevabını geri yükle</button>}</>}
 {a&&!a.deletedAt&&!editing&&<div className="answer-actions">{active&&!archived&&!a.moderatedAt&&<button className="button" disabled={pending} onClick={()=>setEditing(true)}>Admin cevabımı düzenle</button>}<button disabled={pending} onClick={()=>setConfirm(true)}>Admin cevabımı kaldır</button></div>}
 {confirm&&a&&<div className="archive-confirm"><p>Cevabın görünümden kalkacak. Kullanılmış günlük hakkın geri gelmez.</p><button className="button" disabled={pending} onClick={()=>void action(()=>setStatus(a,true))}>Admin cevabını kaldırmayı onayla</button><button disabled={pending} onClick={()=>setConfirm(false)}>Vazgeç</button></div>}
 {active&&!archived&&!a?.moderatedAt&&((editing&&a&&!a.deletedAt)||(!a&&own.assignment.assigned))&&
 (a||quota.remaining>0?<AdminAnswerEditor questionId={questionId} initial={a??undefined} onSaved={reload} reload={reload} onCancel={()=>{if(a)setEditing(false);else void action(()=>assign(own.assignment,false))}}/>:<p>Bugünkü beş farklı soru hakkını kullandın. Geçmiş cevaplarını düzenleyebilirsin.</p>)}
 </div>
}

