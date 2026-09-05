import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { myAnswer,setAnswerStatus,type Answer } from './answerApi'
import { AnswerEditor } from './AnswerEditor'
export function OwnAnswer({questionId,archived,onChange,reloadQuestion}:{questionId:string;archived:boolean;onChange:()=>void;reloadQuestion:()=>void}) {
  const auth=useAuth()
  const [own,setOwn]=useState<Answer|null|undefined>(undefined),[revision,setRevision]=useState(0),[loadError,setLoadError]=useState<ApiError|null>(null)
  const [editing,setEditing]=useState(false),[confirm,setConfirm]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null),[notice,setNotice]=useState('')
  const busy=useRef(false)
  function reload(){setOwn(undefined);setLoadError(null);setEditing(false);setConfirm(false);setError(null);setNotice('');setRevision(r=>r+1);onChange()}
  useEffect(()=>{
    const controller=new AbortController()
    myAnswer(questionId,controller.signal).then(a=>{if(!controller.signal.aborted)setOwn(a)}).catch(e=>{if(!controller.signal.aborted)setLoadError(formError(e))})
    return ()=>controller.abort()
  },[questionId,revision])
  function saved(a:Answer){setOwn(a);setEditing(false);setError(null);setNotice('Cevabın kaydedildi.');onChange()}
  async function status(deleted:boolean){if(!own||busy.current)return;busy.current=true;setPending(true);setError(null);setNotice('')
    try{setOwn(await setAnswerStatus(own,deleted));setConfirm(false);setNotice(deleted?'Cevabın kaldırıldı.':'Cevabın geri yüklendi.');onChange()}
    catch(e){setError(formError(e))}finally{busy.current=false;setPending(false)}
  }
  if(loadError)return <div className="own-answer"><AuthFormError error={loadError}/><button onClick={reload}>Cevabımı tekrar yükle</button></div>
  if(own===undefined)return <p role="status">Cevabın kontrol ediliyor…</p>
  if(!auth.user?.profileCompleted)return <div className="own-answer"><p>Cevap paylaşmak veya yönetmek için profilini tamamla.</p><Link className="button" to="/profile">Profilini tamamla</Link></div>
  if(!own)return archived?<p>Arşivlenmiş soruya yeni cevap verilemez.</p>:<div className="own-answer"><AnswerEditor questionId={questionId} onSaved={saved} reload={reload} reloadQuestion={reloadQuestion}/></div>
  return <div className="own-answer"><h3>Cevabım</h3>
    {notice && <p className="success-notice" role="status">{notice}</p>}
    {own.moderatedAt&&<p role="status">Cevabın Manager tarafından gizlendi. Düzenleme ve geri yükleme kapalıdır.</p>}
    {own.deletedAt?<><p>Cevabını kaldırdın. Diğer kullanıcılar bu cevabı göremez.</p><p className="answer-body removed-answer">{own.body}</p>{archived?<p>Soru arşivlendiği için cevabını geri yükleyemezsin.</p>:!own.moderatedAt&&<button className="button" disabled={pending} onClick={()=>void status(false)}>Cevabı geri yükle</button>}</>:
      editing && !archived && !own.moderatedAt?<AnswerEditor key={own.version} questionId={questionId} initial={own} onSaved={saved} onCancel={()=>setEditing(false)} reload={reload} reloadQuestion={reloadQuestion}/>:
      <><p>{own.moderatedAt?own.body:archived?'Soru arşivlenmiş; cevabını yalnız kaldırabilirsin.':'Bu soruya cevap verdin. Eklemek istediklerin varsa mevcut cevabını düzenleyebilirsin.'}</p><div className="answer-actions">{!archived && !own.moderatedAt && <button className="button" disabled={pending} onClick={()=>{setEditing(true);setNotice('')}}>Cevabımı düzenle</button>}<button disabled={pending} onClick={()=>setConfirm(true)}>Cevabımı kaldır</button></div></>}
    {confirm && <div className="answer-confirm"><p>Cevabın topluluk listesinden kaldırılacak. Soru aktif olduğu sürece aynı cevabı geri yükleyebilirsin.</p><div className="answer-actions"><button className="button" disabled={pending} onClick={()=>void status(true)}>Kaldırmayı onayla</button><button disabled={pending} onClick={()=>setConfirm(false)}>Vazgeç</button></div></div>}
    <AuthFormError error={error}/>{error?.code==='STALE_VERSION' && <button onClick={reload}>Güncel cevabımı yükle</button>}{error?.code==='QUESTION_ARCHIVED' && <button onClick={reloadQuestion}>Güncel soruyu yükle</button>}
  </div>
}
