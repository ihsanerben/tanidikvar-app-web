import { useRef, useState, type FormEvent } from 'react'
import { apiMutation, ApiError, isRecord } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'

type Result={universitiesCreated:number;departmentsCreated:number;skipped:number}
const lines=(value:string)=>value.split(/\r?\n/).map(name=>name.trim()).filter(Boolean)

export function BulkCatalogImport({completed}:{completed:()=>void}){
  const [universities,setUniversities]=useState(''),[departments,setDepartments]=useState(''),[reason,setReason]=useState('')
  const [pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null),[result,setResult]=useState<Result|null>(null)
  const busy=useRef(false),universityList=lines(universities),departmentList=lines(departments)
  async function submit(event:FormEvent){event.preventDefault();if(busy.current||(!universityList.length&&!departmentList.length))return;busy.current=true;setPending(true);setError(null);setResult(null)
    try{const value=await apiMutation('/api/manager/catalog/bulk-import','POST',{universities:universityList,departments:departmentList,reason});if(!isRecord(value)||!['universitiesCreated','departmentsCreated','skipped'].every(key=>Number.isSafeInteger(value[key])))throw new ApiError(200,'INVALID_RESPONSE','İçe aktarma sonucu alınamadı.');setResult(value as unknown as Result);setUniversities('');setDepartments('');completed()}catch(cause){setError(formError(cause))}finally{busy.current=false;setPending(false)}}
  return <details className="bulk-import"><summary>Toplu üniversite ve bölüm ekle</summary><form onSubmit={submit}><p>Her satıra bir kayıt yaz. Üniversiteler ve bölümler bağımsız eklenir; mevcut veya yinelenen adlar atlanır.</p><div className="form-columns"><label>Üniversiteler<textarea rows={10} value={universities} onChange={e=>setUniversities(e.target.value)} placeholder={'Boğaziçi Üniversitesi\nEge Üniversitesi'} disabled={pending}/><span className="form-hint">{universityList.length} üniversite</span></label><label>Bölümler<textarea rows={10} value={departments} onChange={e=>setDepartments(e.target.value)} placeholder={'Bilgisayar Mühendisliği\nPsikoloji'} disabled={pending}/><span className="form-hint">{departmentList.length} bölüm</span></label></div><label>İşlem gerekçesi<input value={reason} onChange={e=>setReason(e.target.value)} maxLength={1000} required disabled={pending}/></label><AuthFormError error={error}/>{result&&<p className="success-notice">{result.universitiesCreated} üniversite ve {result.departmentsCreated} bölüm eklendi. {result.skipped} mevcut veya yinelenen kayıt atlandı.</p>}<button className="button" disabled={pending||(!universityList.length&&!departmentList.length)||universityList.length>500||departmentList.length>1000||!reason.trim()}>{pending?'Ekleniyor…':'Toplu ekle'}</button></form></details>
}
