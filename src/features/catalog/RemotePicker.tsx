import { useEffect, useId, useState } from 'react'
import { getCatalog, getEducation, type Choice, type Page } from './catalogApi'
import { formError } from '../auth/formError'

export function RemotePicker({ label, endpoint, value, onChange, education = false, error, disabled = false }: {
  label: string; endpoint: string; value: Choice | null; onChange: (value: Choice | null) => void; education?: boolean; error?: string; disabled?: boolean
}) {
  const id=useId()
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(0)
  const [result,setResult]=useState<Page<Choice> | null>(null)
  const [failure,setFailure]=useState('')
  const [retry,setRetry]=useState(0)
  const [loading,setLoading]=useState(true)
  useEffect(() => {
    if(disabled) return
    const controller=new AbortController()
    const url=`${endpoint}${endpoint.includes('?')?'&':'?'}q=${encodeURIComponent(query)}&page=${page}&size=20`
    const request=education ? getEducation(url,controller.signal).then(p => ({...p,items:p.items.map(e => ({id:e.id,label:e.departmentName}))}))
      : getCatalog(url,controller.signal).then(p => ({...p,items:p.items.map(e => ({id:e.id,label:e.name}))}))
    request.then(data => { if(!controller.signal.aborted) {setResult(data);setLoading(false);setFailure('')} })
      .catch(reason => {if(!controller.signal.aborted){setFailure(formError(reason).message);setLoading(false)}})
    return () => controller.abort()
  },[endpoint,query,page,retry,education,disabled])
  function refresh() {setLoading(true);setRetry(retry+1)}
  return <div className="remote-picker">
    <label htmlFor={`${id}-search`}>{label} ara</label><input id={`${id}-search`} type="search" maxLength={100} value={query} disabled={disabled}
      onChange={e=>{setQuery(e.target.value);setPage(0);setLoading(true)}} />
    <label htmlFor={id}>{label}</label><select id={id} disabled={disabled || loading} value={value?.id ?? ''}
      aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined}
      onChange={event=>onChange(result?.items.find(item=>item.id===event.target.value) ?? null)}>
      <option value="">{disabled?'Önce üniversite seç':loading?'Yükleniyor…':'Seç'}</option>
      {value && !result?.items.some(item=>item.id===value.id) && <option value={value.id}>{value.label} (mevcut seçim)</option>}
      {result?.items.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    {!disabled && failure && <div role="alert">{failure} <button type="button" onClick={refresh}>Tekrar dene</button></div>}
    {!disabled && !loading && !failure && result?.items.length===0 && <p className="field-help">Bu aramada kayıt bulunamadı.</p>}
    {!disabled && result && result.totalElements>result.size && <div className="pagination">
      <button type="button" disabled={page===0 || loading} onClick={()=>{setPage(page-1);setLoading(true)}}>Önceki</button>
      <span>{page+1} / {Math.ceil(result.totalElements/result.size)}</span>
      <button type="button" disabled={(page+1)*result.size>=result.totalElements || loading} onClick={()=>{setPage(page+1);setLoading(true)}}>Sonraki</button>
    </div>}
  </div>
}
