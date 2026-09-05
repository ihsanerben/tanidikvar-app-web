import { useEffect,useState } from 'react'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { Page } from '../catalog/catalogApi'
import { questionDate } from '../questions/questionApi'
import { listAnswers,type Answer } from './answerApi'
export function AnswerList({questionId,revision}:{questionId:string;revision:number}) {
  const [page,setPage]=useState(0),[retry,setRetry]=useState(0),[data,setData]=useState<Page<Answer>|null>(null),[error,setError]=useState<ApiError|null>(null),[loaded,setLoaded]=useState('')
  const key=`${page}:${revision}:${retry}`
  useEffect(()=>{
    const controller=new AbortController()
    listAnswers(questionId,page,controller.signal).then(result=>{if(!controller.signal.aborted){
      if(page>0&&result.items.length===0){setPage(Math.max(0,Math.ceil(result.totalElements/result.size)-1));return}
      setData(result);setError(null);setLoaded(key)
    }}).catch(e=>{if(!controller.signal.aborted){setError(formError(e));setLoaded(key)}})
    return ()=>controller.abort()
  },[questionId,page,key])
  if(loaded!==key)return <p role="status">Cevaplar yükleniyor…</p>
  if(error)return <div><AuthFormError error={error}/><button onClick={()=>setRetry(r=>r+1)}>Cevapları tekrar yükle</button></div>
  return <div className="community-list"><p className="answer-total" role="status">{data?.totalElements??0} topluluk cevabı</p>
    {data?.items.length===0?<p className="answer-empty">Henüz topluluk cevabı yok.</p>:data?.items.map(a=><article className="answer-card" key={a.id}><div className="answer-author"><span className="answer-avatar" aria-hidden="true">{a.authorName.slice(0,1).toLocaleUpperCase('tr')}</span><div><h3>{a.authorName}</h3><div className="question-meta"><time dateTime={a.publishedAt}>{questionDate(a.publishedAt)}</time>{a.editedAt && <span>Cevap düzenlendi · <time dateTime={a.editedAt}>{questionDate(a.editedAt)}</time></span>}</div></div></div><p className="answer-body">{a.body}</p></article>)}
    {data && data.totalElements>data.size && <div className="pagination"><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Önceki cevaplar</button><span>Sayfa {page+1} / {Math.ceil(data.totalElements/data.size)}</span><button disabled={(page+1)*data.size>=data.totalElements} onClick={()=>setPage(p=>p+1)}>Sonraki cevaplar</button></div>}
  </div>
}
