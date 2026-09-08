import { useRef,useState,type FormEvent } from 'react'
import { ApiError,apiMutation,isRecord } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'

type Result={tagsCreated:number;skipped:number}
function tagsFrom(text:string){return text.split(/\r?\n/).map(value=>value.trim()).filter(Boolean)}

export function BulkTagImport({completed}:{completed:()=>void}){
 const [text,setText]=useState(''),[reason,setReason]=useState(''),[error,setError]=useState<ApiError|null>(null),[result,setResult]=useState<Result|null>(null),[pending,setPending]=useState(false),busy=useRef(false)
 const tags=tagsFrom(text)
 async function submit(e:FormEvent){e.preventDefault();if(busy.current||!tags.length)return;busy.current=true;setPending(true);setError(null);setResult(null);try{const value=await apiMutation('/api/manager/catalog/tags/bulk-import','POST',{tags,reason});if(!isRecord(value)||!Number.isSafeInteger(value.tagsCreated)||!Number.isSafeInteger(value.skipped))throw new ApiError(200,'INVALID_RESPONSE','Toplu tag ekleme sonucu alınamadı.');setResult(value as unknown as Result);completed()}catch(reason){setError(formError(reason))}finally{busy.current=false;setPending(false)}}
 return <details className="bulk-import"><summary>Toplu tag ekle</summary><form onSubmit={submit}><p>Her satıra bir tag yaz. Mevcut veya listede yinelenen tagler tekrar eklenmez; en fazla 500 tag tek işlemde eklenebilir.</p><label>Tagler<textarea disabled={pending} rows={10} value={text} onChange={e=>setText(e.target.value)} placeholder={'Erasmus\nYurt dışı eğitim\nKampüs hayatı'} maxLength={100500} required/></label><p className="form-hint">Eklenecek satır sayısı: {tags.length}</p><label>İşlem gerekçesi<input disabled={pending} value={reason} onChange={e=>setReason(e.target.value)} maxLength={1000} required/></label><AuthFormError error={error}/>{result&&<p className="success-notice">{result.tagsCreated} tag eklendi. {result.skipped} mevcut veya yinelenen tag atlandı.</p>}<button className="button" disabled={pending||!tags.length||tags.length>500||!reason.trim()}>{pending?'Tagler ekleniyor…':'Kontrol et ve toplu ekle'}</button></form></details>
}
