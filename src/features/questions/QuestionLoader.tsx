import { useEffect,useState,type ReactNode } from 'react'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { getQuestion,type Question } from './questionApi'
export function QuestionLoader({id,children}:{id:string;children:(question:Question,reload:()=>void)=>ReactNode}) {
  const [data,setData]=useState<Question|null>(null)
  const [error,setError]=useState<ApiError|null>(null)
  const [revision,setRevision]=useState(0)
  function reload(){setData(null);setError(null);setRevision(r=>r+1)}
  useEffect(()=>{
    const controller=new AbortController()
    getQuestion(id,controller.signal).then(q=>{if(!controller.signal.aborted)setData(q)}).catch(e=>{if(!controller.signal.aborted)setError(formError(e))})
    return ()=>controller.abort()
  },[id,revision])
  if(error)return <section className="status-page"><h1>{error.status===404?'Soru bulunamadı.':'Soru yüklenemedi.'}</h1><AuthFormError error={error}/><button className="button" onClick={reload}>Tekrar dene</button></section>
  if(!data)return <section className="status-page" role="status">Soru yükleniyor…</section>
  return children(data,reload)
}
