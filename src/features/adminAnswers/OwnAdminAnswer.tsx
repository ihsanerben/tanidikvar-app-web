import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { useAuth } from '../auth/useAuth'
import type { ApiError } from '../../api/apiClient'
import { getOwn,getQuota,setStatus,type OwnAdminAnswer as Own,type Quota } from './adminAnswerApi'
import { AdminAnswerEditor } from './AdminAnswerEditor'
import { AdminAnswerCard } from './AdminAnswerCard'
import { ComposerDialog } from '../answers/ComposerDialog'
export function OwnAdminAnswer({questionId,archived,reload,onLoaded}:{questionId:string;archived:boolean;reload:()=>void;onLoaded?:(id:string|null)=>void}){
 const auth=useAuth(),[data,setData]=useState<{own:Own;quota:Quota}|null>(null),[error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false),[editing,setEditing]=useState(false)
 useEffect(()=>{const c=new AbortController();Promise.all([getOwn(questionId,c.signal),getQuota(c.signal)]).then(([own,quota])=>{if(!c.signal.aborted){setData({own,quota});onLoaded?.(own.answer?.id??null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[questionId,onLoaded])
 async function change(deleted:boolean){if(pending||!data?.own.answer)return;setPending(true);try{await setStatus(data.own.answer,deleted);reload()}catch(e){setError(formError(e))}finally{setPending(false)}}
 if(!data)return error?<><AuthFormError error={error}/><button onClick={reload}>Admin bilgilerini yeniden yükle</button></>:null
 const a=data.own.answer,active=data.quota.activeAdmin
 if(!active&&!a)return null
 if(!auth.user?.profileCompleted)return <Link to="/profile">Profilini tamamla</Link>
 return <div className="own-answer compact-own-answer">
 {!a&&active&&!archived&&<div className="answer-compose-action"><button className="answer-add-button" disabled={data.quota.remaining===0} onClick={()=>setEditing(true)} aria-label="Admin yorumu yap"><span aria-hidden="true">+</span> Yorum yap</button></div>}
 {!a&&active&&data.quota.remaining===0&&<p>Bugünkü beş yorum hakkını kullandın.</p>}
 {a?.moderatedAt&&<p>Admin yorumun Manager tarafından gizlendi.</p>}{a&&<div className="own-answer-row"><AdminAnswerCard answer={a}/><div className="answer-actions">
 {!a.deletedAt?<>{active&&!archived&&!a.moderatedAt&&<button className="button button-warning" disabled={pending} onClick={()=>setEditing(true)}>Düzenle</button>}<button className="button button-danger" disabled={pending} onClick={()=>void change(true)}>Sil</button></>:
 active&&!archived&&!a.moderatedAt&&<button className="button button-success" disabled={pending} onClick={()=>void change(false)}>Geri yükle</button>}
 </div></div>}
 {editing&&<ComposerDialog title={a?'Admin yorumunu düzenle':'Admin yorumu'} onClose={()=>setEditing(false)}><p>Kalan yorum hakkın: {data.quota.remaining} / {data.quota.limit}</p><AdminAnswerEditor questionId={questionId} initial={a??undefined} onSaved={reload} reload={reload} onCancel={()=>setEditing(false)}/></ComposerDialog>}
 <AuthFormError error={error}/></div>
}
