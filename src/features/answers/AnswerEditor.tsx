import { useRef,useState,type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { createAnswer,updateAnswer,type Answer } from './answerApi'
export function AnswerEditor({questionId,initial,onSaved,onCancel,reload,reloadQuestion}:{questionId:string;initial?:Answer;onSaved:(a:Answer)=>void;onCancel?:()=>void;reload:()=>void;reloadQuestion:()=>void}) {
  const [body,setBody]=useState(initial?.body??''),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null)
  const busy=useRef(false),form=useRef<HTMLFormElement>(null)
  async function submit(event:FormEvent){event.preventDefault();if(busy.current)return;busy.current=true;setPending(true);setError(null)
    try{onSaved(initial?await updateAnswer(initial,body):await createAnswer(questionId,body))}
    catch(e){setError(formError(e));requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus())}
    finally{busy.current=false;setPending(false)}
  }
  return <form className="answer-editor" onSubmit={submit} ref={form}><label htmlFor="answer-body">{initial?'Cevabını düzenle':'Cevabın'}</label>

    <textarea id="answer-body" rows={6} required minLength={10} maxLength={5000} value={body} disabled={pending} onChange={e=>setBody(e.target.value)} aria-invalid={!!error?.fieldErrors.body} aria-describedby={error?.fieldErrors.body?'answer-body-error':undefined}/>
    {error?.fieldErrors.body && <p className="field-error" id="answer-body-error">{error.fieldErrors.body}</p>}
    <AuthFormError error={error}/>{error && ['STALE_VERSION','ANSWER_EXISTS','ANSWER_REMOVED'].includes(error.code) && <button type="button" onClick={reload}>Güncel cevabımı yükle</button>}
    {error?.code==='QUESTION_ARCHIVED' && <button type="button" onClick={reloadQuestion}>Güncel soruyu yükle</button>}
    {error?.code==='PROFILE_REQUIRED' && <Link to="/profile">Profilini tamamla</Link>}
    <div className="answer-actions"><button className="button" disabled={pending}>{pending?'Kaydediliyor…':initial?'Cevap değişikliklerini kaydet':'Cevabı yayınla'}</button>{onCancel && <button type="button" disabled={pending} onClick={onCancel}>Vazgeç</button>}</div>
  </form>
}
