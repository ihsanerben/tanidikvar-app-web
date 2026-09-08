import { useRef,useState,type FormEvent } from 'react'
import { ApiError,apiMutation,isRecord } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'

const example=`{
  "universities": ["Örnek Üniversitesi"],
  "departments": ["Bilgisayar Mühendisliği"],
  "matches": [
    {"university": "Örnek Üniversitesi", "department": "Bilgisayar Mühendisliği"}
  ]
}`
type Result={universitiesCreated:number;departmentsCreated:number;matchesCreated:number;skipped:number}
function payload(text:string,reason:string){const value:unknown=JSON.parse(text);if(!isRecord(value)||!Array.isArray(value.universities)||!Array.isArray(value.departments)||!Array.isArray(value.matches))throw new ApiError(400,'INVALID_IMPORT','JSON; universities, departments ve matches dizilerini içermeli.');return {...value,reason}}
export function BulkCatalogImport({completed}:{completed:()=>void}){
 const [text,setText]=useState(''),[reason,setReason]=useState(''),[error,setError]=useState<ApiError|null>(null),[result,setResult]=useState<Result|null>(null),[pending,setPending]=useState(false),busy=useRef(false)
 async function submit(e:FormEvent){e.preventDefault();if(busy.current)return;busy.current=true;setPending(true);setError(null);setResult(null);try{const value=await apiMutation('/api/manager/catalog/bulk-import','POST',payload(text,reason));if(!isRecord(value)||!['universitiesCreated','departmentsCreated','matchesCreated','skipped'].every(k=>Number.isSafeInteger(value[k])))throw new ApiError(200,'INVALID_RESPONSE','İçe aktarma sonucu alınamadı.');setResult(value as unknown as Result);completed()}catch(reason){setError(formError(reason))}finally{busy.current=false;setPending(false)}}
 return <details className="bulk-import"><summary>Toplu katalog ekle</summary><form onSubmit={submit}><p>AI’dan aşağıdaki JSON biçiminde çıktı iste. İsimler mevcut kayıtlarla eşleşirse yinelenmez; herhangi bir hata olursa işlemin tamamı geri alınır.</p><pre>{example}</pre><label>JSON verisi<textarea rows={12} value={text} onChange={e=>setText(e.target.value)} placeholder={example} required/></label><label>İşlem gerekçesi<input value={reason} onChange={e=>setReason(e.target.value)} maxLength={1000} required/></label><AuthFormError error={error}/>{result&&<p className="success-notice">{result.universitiesCreated} üniversite, {result.departmentsCreated} bölüm ve {result.matchesCreated} eşleşme eklendi. {result.skipped} mevcut kayıt atlandı.</p>}<button className="button" disabled={pending||!text.trim()||!reason.trim()}>{pending?'İçe aktarılıyor…':'Kontrol et ve toplu ekle'}</button></form></details>
}
