import { CatalogStatusDecision } from '../management/CatalogStatusDecision'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { RemotePicker } from './RemotePicker'
import { createEducation, getEducation, setEducationStatus, type Choice, type Education, type Page } from './catalogApi'
export function EducationEditor(){
  const [university,setUniversity]=useState<Choice|null>(null)
  return <div><RemotePicker label="Üniversite" endpoint="/api/manager/catalog/UNIVERSITY?includeDeleted=true" value={university} onChange={setUniversity}/>
    {university?<EducationList key={university.id} university={university}/>:<p className="empty-state">Bölümlerini yönetmek için bir üniversite seç.</p>}</div>
}
function EducationList({university}:{university:Choice}){
  const [department,setDepartment]=useState<Choice|null>(null)
  const [reason,setReason]=useState(''),[statusEntry,setStatusEntry]=useState<Education|null>(null)
  const [result,setResult]=useState<Page<Education>|null>(null)
  const [page,setPage]=useState(0)
  const [revision,setRevision]=useState(0)
  const [error,setError]=useState<ApiError|null>(null)
  const [notice,setNotice]=useState('')
  const [pending,setPending]=useState(false)
  const busy=useRef(false)
  useEffect(()=>{
    const controller=new AbortController()
    getEducation(`/api/manager/university-departments?universityId=${university.id}&includeDeleted=true&page=${page}&size=20`,controller.signal)
      .then(value=>{if(!controller.signal.aborted)setResult(value)}).catch(reason=>{if(!controller.signal.aborted)setError(formError(reason))})
    return()=>controller.abort()
  },[university.id,page,revision])
  async function mutate(action:()=>Promise<unknown>){
    if(busy.current)return
    busy.current=true;setPending(true);setError(null);setNotice('')
    try{await action();setNotice('Eşleşme kaydedildi.');setRevision(revision+1)}catch(reason){setError(formError(reason))}
    finally{busy.current=false;setPending(false)}
  }
  function submit(event:FormEvent){event.preventDefault();if(department)void mutate(()=>createEducation(university.id,department.id,reason))}
  return <div className="catalog-editor"><form onSubmit={submit} className="education-create"><RemotePicker label="Eklenecek bölüm" endpoint="/api/departments" value={department} onChange={setDepartment}/>
    <label>Eşleştirme gerekçesi<input required maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label><button className="button" disabled={!department || pending||!reason.trim()}>Üniversiteye bölüm ekle</button></form>
    <AuthFormError error={error}/>{error && <button type="button" onClick={()=>{setError(null);setRevision(revision+1)}}>Listeyi yenile</button>}
    {notice && <p role="status" className="success-notice">{notice}</p>}
    {!result?<p role="status">Eşleşmeler yükleniyor…</p>:result.items.length===0?<p className="empty-state">Bu üniversiteye henüz bölüm eklenmemiş.</p>:
      <ul className="catalog-list">{result.items.map(entry=><li key={entry.id}><span className="catalog-name">{entry.departmentName}<small>{entry.deletedAt?'Pasif':entry.available?'Aktif':'Üniversite veya bölüm pasif'}</small></span>
        <button type="button" disabled={pending} onClick={()=>setStatusEntry(entry)}>{entry.deletedAt?'Geri yükle':'Pasife al'}</button></li>)}</ul>}
    {statusEntry&&<CatalogStatusDecision key={statusEntry.id} kind="UNIVERSITY_DEPARTMENT" id={statusEntry.id} deleted={!!statusEntry.deletedAt} apply={reason=>setEducationStatus(statusEntry,reason)} reload={()=>{setStatusEntry(null);setRevision(r=>r+1)}} cancel={()=>setStatusEntry(null)}/>}
    {result && result.totalElements>result.size && <div className="pagination"><button type="button" disabled={page===0} onClick={()=>setPage(page-1)}>Önceki sayfa</button><span>Sayfa {page+1}</span>
      <button type="button" disabled={(page+1)*result.size>=result.totalElements} onClick={()=>setPage(page+1)}>Sonraki sayfa</button></div>}
  </div>
}
