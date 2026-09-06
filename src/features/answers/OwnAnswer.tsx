import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { myAnswer,setAnswerStatus,type Answer } from './answerApi'
import { AnswerEditor } from './AnswerEditor'
import { ComposerDialog } from './ComposerDialog'
import { ProfileTrigger } from '../profile/PublicProfilePopup'
export function OwnAnswer({questionId,archived,onChange,reloadQuestion,onLoaded}:{questionId:string;archived:boolean;onChange:()=>void;reloadQuestion:()=>void;onLoaded?:(id:string|null)=>void}) {
 const auth=useAuth(),[own,setOwn]=useState<Answer|null|undefined>(),[revision,setRevision]=useState(0),[editing,setEditing]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null)
 function reload(){setRevision(v=>v+1);setEditing(false);setError(null);onChange()}
 useEffect(()=>{const c=new AbortController();myAnswer(questionId,c.signal).then(a=>{if(!c.signal.aborted){setOwn(a);onLoaded?.(a?.id??null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[questionId,revision,onLoaded])
 function saved(a:Answer){setOwn(a);onLoaded?.(a.id);setEditing(false);onChange()}
 async function status(deleted:boolean){if(!own||pending)return;setPending(true);try{setOwn(await setAnswerStatus(own,deleted));onChange()}catch(e){setError(formError(e))}finally{setPending(false)}}
 if(own===undefined)return error?<><AuthFormError error={error}/><button onClick={reload}>Cevabımı tekrar yükle</button></>:null
 if(!auth.user?.profileCompleted)return <Link to="/profile">Profilini tamamla</Link>
 return <div className="own-answer compact-own-answer">
 {!own&&!archived&&<div className="answer-compose-action"><button className="answer-add-button" onClick={()=>setEditing(true)} aria-label="Topluluk yorumu yap"><span aria-hidden="true">+</span> Yorum yap</button></div>}
 {own&&<div className="own-answer-row"><article className="answer-card"><h3><ProfileTrigger id={own.authorId} name={own.authorName} avatarFileId={own.avatarFileId}/></h3><p className="answer-body">{own.body}</p>
 {own.moderatedAt&&<p>Yorumun Manager tarafından gizlendi.</p>}
 </article><div className="answer-actions">{own.deletedAt?(!archived&&!own.moderatedAt&&<button className="button button-success" disabled={pending} onClick={()=>void status(false)}>Geri yükle</button>):<>{!archived&&!own.moderatedAt&&<button className="button button-warning" disabled={pending} onClick={()=>setEditing(true)}>Düzenle</button>}<button className="button button-danger" disabled={pending} onClick={()=>void status(true)}>Sil</button></>}</div></div>}
 {editing&&<ComposerDialog title={own?'Yorumunu düzenle':'Topluluk yorumu'} onClose={()=>setEditing(false)}><AnswerEditor questionId={questionId} initial={own??undefined} onSaved={saved} onCancel={()=>setEditing(false)} reload={reload} reloadQuestion={reloadQuestion}/></ComposerDialog>}
 <AuthFormError error={error}/></div>
}
