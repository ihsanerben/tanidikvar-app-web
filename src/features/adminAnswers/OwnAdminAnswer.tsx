import { useEffect,useLayoutEffect,useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { useAuth } from '../auth/useAuth'
import type { ApiError } from '../../api/apiClient'
import { getOwn,getQuota,setStatus,type OwnAdminAnswer as Own,type Quota } from './adminAnswerApi'
import { AdminAnswerEditor } from './AdminAnswerEditor'
import { AdminAnswerCard } from './AdminAnswerCard'
import { ComposerDialog } from '../answers/ComposerDialog'
export function OwnAdminAnswer({questionId,archived,composeRevision=0,loadRevision=0,onComposeType,reload,onLoaded}:{questionId:string;archived:boolean;composeRevision?:number;loadRevision?:number;onComposeType?:(type:string)=>void;reload:()=>void;onLoaded?:(id:string|null)=>void}){
 const auth=useAuth(),[data,setData]=useState<{own:Own;quota:Quota}|null>(null),[error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false),[editing,setEditing]=useState(false)
 const previousComposeRevision=useRef(0)
 useEffect(()=>{const c=new AbortController();Promise.all([getOwn(questionId,c.signal),getQuota(c.signal)]).then(([own,quota])=>{if(!c.signal.aborted){setData({own,quota});onLoaded?.(own.answer?.id??null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[questionId,loadRevision,onLoaded])
 const a=data?.own.answer,active=!!data&&(data.quota.activeAdmin||auth.user?.role==='ADMIN')
 useLayoutEffect(()=>{if(!data)return;if(composeRevision>previousComposeRevision.current&&!archived&&active&&(a||data.quota.remaining>0))setEditing(true);previousComposeRevision.current=composeRevision},[composeRevision,archived,active,a,data])
 async function change(deleted:boolean){if(pending||!data?.own.answer)return;setPending(true);try{await setStatus(data.own.answer,deleted);reload()}catch(e){setError(formError(e))}finally{setPending(false)}}
 if(!data)return error?<><AuthFormError error={error}/><button onClick={reload}>Admin bilgilerini yeniden yükle</button></>:null
 if(!active&&!a)return null
 if(!auth.user?.profileCompleted)return <Link to="/profile">Profilini tamamla</Link>
 return <div className="own-answer compact-own-answer">
 {!a&&active&&data.quota.remaining===0&&<p>Bugünkü beş yorum hakkını kullandın.</p>}
 {a?.moderatedAt&&<p>Admin yorumun Manager tarafından gizlendi.</p>}{a&&<div className="own-answer-row"><AdminAnswerCard answer={a}/><div className="answer-actions">
 {!a.deletedAt?<>{active&&!archived&&!a.moderatedAt&&<button className="button button-warning" disabled={pending} onClick={()=>setEditing(true)}>Düzenle</button>}<button className="button button-danger" disabled={pending} onClick={()=>void change(true)}>Sil</button></>:
 active&&!archived&&!a.moderatedAt&&<button className="button button-success" disabled={pending} onClick={()=>void change(false)}>Geri yükle</button>}
 </div></div>}
 {editing&&<ComposerDialog title={a?'Admin yorumunu düzenle':'Yorum yap'} onClose={()=>setEditing(false)}><div className="comment-kind-switch" role="group" aria-label="Yorum türü"><button type="button" className="is-selected">Admin yorumu</button><button type="button" onClick={()=>{setEditing(false);onComposeType?.('community')}}>Topluluk yorumu</button></div><p>Kalan yorum hakkın: {data.quota.remaining} / {data.quota.limit}</p><AdminAnswerEditor questionId={questionId} initial={a??undefined} onSaved={()=>{setEditing(false);reload()}} reload={reload} onCancel={()=>setEditing(false)}/></ComposerDialog>}
 <AuthFormError error={error}/></div>
}
