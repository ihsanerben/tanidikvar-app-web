import { useRef,useState } from 'react'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
import { save,type AdminAnswer } from './adminAnswerApi'
export function AdminAnswerEditor({questionId,initial,onSaved,onCancel,reload}:{questionId:string;initial?:AdminAnswer;onSaved:()=>void;onCancel:()=>void;reload:()=>void}){
 const [body,setBody]=useState(initial?.body??''),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null),busy=useRef(false)
 return <form className="answer-editor" onSubmit={e=>{e.preventDefault();if(busy.current)return;busy.current=true;setPending(true);setError(null);void save(questionId,body,initial).then(onSaved).catch(e=>setError(formError(e))).finally(()=>{busy.current=false;setPending(false)})}}>
 <label htmlFor="admin-answer-body">{initial?'Admin cevabını düzenle':'Admin cevabın'}</label>
 <textarea id="admin-answer-body" required minLength={10} maxLength={5000} rows={6} disabled={pending} value={body} onChange={e=>setBody(e.target.value)} aria-invalid={!!error?.fieldErrors.body}/>
 <AuthFormError error={error}/>{error&&<button type="button" onClick={reload}>Güncel Admin bilgilerini yükle</button>}
 <div className="answer-actions"><button className="button" disabled={pending}>{pending?'Kaydediliyor…':initial?'Admin cevabı değişikliklerini kaydet':'Admin cevabını yayınla'}</button><button type="button" disabled={pending} onClick={onCancel}>Vazgeç</button></div></form>
}

