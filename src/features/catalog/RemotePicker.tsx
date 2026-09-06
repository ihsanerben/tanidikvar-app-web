import { useEffect, useId, useState } from 'react'
import { getCatalog, getEducation, type Choice, type Page } from './catalogApi'
import { formError } from '../auth/formError'

export function RemotePicker({ label, endpoint, value, onChange, education = false, error, disabled = false, compact = false }: {
  label: string; endpoint: string; value: Choice | null; onChange: (value: Choice | null) => void; education?: boolean; error?: string; disabled?: boolean; compact?: boolean
}) {
  const id=useId()
  const [result,setResult]=useState<Page<Choice>|null>(null),[failure,setFailure]=useState(''),[retry,setRetry]=useState(0)
  useEffect(()=>{
    if(disabled)return
    const controller=new AbortController()
    async function list(){
      const items:Choice[]=[]
      let page=0,total=0
      do {
        const url=`${endpoint}${endpoint.includes('?')?'&':'?'}page=${page}&size=${compact?10:100}`
        const data=education?await getEducation(url,controller.signal).then(p=>({...p,items:p.items.map(e=>({id:e.id,label:e.departmentName}))}))
          :await getCatalog(url,controller.signal).then(p=>({...p,items:p.items.map(e=>({id:e.id,label:e.name}))}))
        items.push(...data.items);total=data.totalElements;page++
        if(compact||data.items.length===0)break
      }while(items.length<total)
      if(!controller.signal.aborted){setResult({items,page:0,size:items.length,totalElements:total});setFailure('')}
    }
    void list().catch(reason=>{if(!controller.signal.aborted)setFailure(formError(reason).message)})
    return()=>controller.abort()
  },[endpoint,retry,education,disabled,compact])
  return <div className="remote-picker">
    <label htmlFor={id}>{label}</label><select id={id} disabled={disabled||(!result&&!failure)} value={value?.id??''}
      aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined}
      onChange={event=>onChange(result?.items.find(item=>item.id===event.target.value)??null)}>
      <option value="">{disabled?'Önce üniversite seç':!result&&!failure?'Yükleniyor…':'Seç'}</option>
      {value&&!result?.items.some(item=>item.id===value.id)&&<option value={value.id}>{value.label} (mevcut seçim)</option>}
      {result?.items.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    {error&&<p className="field-error" id={`${id}-error`}>{error}</p>}
    {!disabled&&failure&&<div role="alert">{failure} <button type="button" onClick={()=>{setFailure('');setResult(null);setRetry(r=>r+1)}}>Tekrar dene</button></div>}
    {!disabled&&result?.items.length===0&&!failure&&<p role="status">Seçenek bulunamadı.</p>}
  </div>
}
