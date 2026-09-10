import { useEffect, useId, useState } from 'react'
import { getCatalog, type Choice, type Page } from './catalogApi'
import { formError } from '../auth/formError'

export function RemotePicker({ label, endpoint, value, onChange, error, disabled = false, compact = false }: {
  label: string; endpoint: string; value: Choice | null; onChange: (value: Choice | null) => void; error?: string; disabled?: boolean; compact?: boolean
}) {
  const id=useId()
  const [response,setResponse]=useState<{key:string;data:Page<Choice>|null;error:string}|null>(null),[retry,setRetry]=useState(0)
  const requestKey=JSON.stringify([endpoint,disabled,compact,retry])
  const current=response?.key===requestKey?response:null,result=current?.data??null,failure=current?.error??''
  useEffect(()=>{
    if(disabled)return
    const controller=new AbortController()
    async function list(){
      const items:Choice[]=[]
      let page=0,total=0
      do {
        const url=`${endpoint}${endpoint.includes('?')?'&':'?'}page=${page}&size=${compact?10:100}`
        const data=await getCatalog(url,controller.signal).then(p=>({...p,items:p.items.map(e=>({id:e.id,label:e.name}))}))
        items.push(...data.items);total=data.totalElements;page++
        if(compact||data.items.length===0)break
      }while(items.length<total)
      if(!controller.signal.aborted)setResponse({key:requestKey,data:{items,page:0,size:items.length,totalElements:total},error:''})
    }
    void list().catch(reason=>{if(!controller.signal.aborted)setResponse({key:requestKey,data:null,error:formError(reason).message})})
    return()=>controller.abort()
  },[endpoint,requestKey,disabled,compact])
  return <div className="remote-picker">
    <label htmlFor={id}>{label}</label><select id={id} disabled={disabled||(!result&&!failure)} value={value?.id??''}
      aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined}
      onChange={event=>onChange(result?.items.find(item=>item.id===event.target.value)??null)}>
      <option value="">{disabled?'Önce üniversite seç':!result&&!failure?'Yükleniyor…':'Seç'}</option>
      {value&&!result?.items.some(item=>item.id===value.id)&&<option value={value.id}>{value.label} (mevcut seçim)</option>}
      {result?.items.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    {error&&<p className="field-error" id={`${id}-error`}>{error}</p>}
    {!disabled&&failure&&<div role="alert">{failure} <button type="button" onClick={()=>setRetry(r=>r+1)}>Tekrar dene</button></div>}
    {!disabled&&result?.items.length===0&&!failure&&<p role="status">Seçenek bulunamadı.</p>}
  </div>
}
