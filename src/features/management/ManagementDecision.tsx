import { useRef,useState,type FormEvent } from 'react'
import type { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
export function ManagementDecision({label,explanation,apply,reload}:{label:string;explanation:string;apply:(reason:string)=>Promise<unknown>;reload:()=>void}){
 const [open,setOpen]=useState(false),[reason,setReason]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null),busy=useRef(false)
 async function submit(e:FormEvent){e.preventDefault();if(busy.current)return;busy.current=true;setPending(true);setError(null);try{await apply(reason.trim());reload()}catch(e){setError(formError(e))}finally{busy.current=false;setPending(false)}}
 if(!open)return <button className="button button-secondary" onClick={()=>setOpen(true)}>{label}</button>
 return <form className="management-decision" onSubmit={e=>void submit(e)}><p>{explanation}</p><label>İşlem gerekçesi<textarea required maxLength={1000} value={reason} disabled={pending} onChange={e=>setReason(e.target.value)}/></label><AuthFormError error={error}/>
 {error?.code==='STALE_VERSION'?<button type="button" onClick={reload}>Güncel listeyi yükle</button>:<button className="button" disabled={pending||!reason.trim()}>{pending?'İşleniyor…':label+' — onayla'}</button>}
 <button type="button" disabled={pending} onClick={()=>{setOpen(false);setReason('');setError(null)}}>Vazgeç</button></form>
}
