import { useEffect,useState } from 'react'
import type { Page } from '../catalog/catalogApi'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
import { listAnswers,type AdminAnswer } from './adminAnswerApi'
import { AdminAnswerCard } from './AdminAnswerCard'
export function AdminAnswerFeed({path,showQuestion=false,excludeId=null}:{path:string;showQuestion?:boolean;excludeId?:string|null}){
 const [page,setPage]=useState(0),[revision,setRevision]=useState(0)
 return <AdminAnswerPage excludeId={excludeId} key={path+page+':'+revision} path={path} page={page} showQuestion={showQuestion} setPage={setPage} retry={()=>setRevision(r=>r+1)}/>
}
function AdminAnswerPage({path,page,showQuestion,setPage,retry,excludeId}:{excludeId:string|null;path:string;page:number;showQuestion:boolean;setPage:(n:number)=>void;retry:()=>void}){
 const [data,setData]=useState<Page<AdminAnswer>|null>(null),[error,setError]=useState<ApiError|null>(null)
 useEffect(()=>{const c=new AbortController();listAnswers(path+'?page='+page+'&size=10',c.signal).then(v=>{if(!c.signal.aborted)setData(v)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[path,page])
 if(error)return <div><AuthFormError error={error}/><button onClick={retry}>Admin yorumlarını yeniden yükle</button></div>
 if(!data)return <p role="status">Admin yorumları yükleniyor…</p>
 return <><p className="answer-count">{data.totalElements} Admin yorumu</p>{data.items.length?data.items.filter(a=>a.id!==excludeId).map(a=><AdminAnswerCard key={a.id} answer={a} showQuestion={showQuestion}/>):<p>Henüz Admin yorumu yok.</p>}
 <nav className="pagination" aria-label="Admin yorum sayfaları"><button disabled={page===0} onClick={()=>setPage(page-1)}>Önceki Admin yorumları</button><span>Sayfa {page+1}</span><button disabled={(page+1)*data.size>=data.totalElements} onClick={()=>setPage(page+1)}>Sonraki Admin yorumları</button></nav></>
}
