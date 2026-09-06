import { useEffect,useState } from 'react'
import { Link,useSearchParams } from 'react-router-dom'
import { listAdmins,avatarUrl,type AdminProfile } from '../adminAnswers/adminAnswerApi'
import type { Page } from '../catalog/catalogApi'
import type { ApiError } from '../../api/apiClient'
import { formError } from '../auth/formError'
import { AuthFormError } from '../auth/AuthFormError'
import { SearchForm } from './SearchForm'
export function AdminDirectoryPage(){
 const [params,setParams]=useSearchParams(),[revision,retry]=useState(0)
 const query=params.toString()
 return <section className="questions-page"><div className="questions-heading"><div><h1>Adminleri keşfet</h1></div></div>

 <SearchForm label="Admin adı ara" value={params.get('q')??''} onSearch={q=>setParams(q?{q}:{})}/>
 <AdminResults key={query+':'+revision} query={query} retry={()=>retry(r=>r+1)} page={value=>{const next=new URLSearchParams(params);next.set('page',String(value));setParams(next)}}/>
 </section>
}
function AdminResults({query,retry,page}:{query:string;retry:()=>void;page:(value:number)=>void}){
 const [result,setResult]=useState<Page<AdminProfile>|null>(null),[error,setError]=useState<ApiError|null>(null)
 useEffect(()=>{const c=new AbortController();listAdmins(query,c.signal).then(data=>{if(!c.signal.aborted)setResult(data)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return ()=>c.abort()},[query])
 if(error)return <div className="auth-card"><AuthFormError error={error}/><button onClick={retry}>Tekrar dene</button></div>
 if(!result)return <p role="status">Adminler yükleniyor…</p>
 return <><div className="admin-directory">{result.items.map(a=><article className="question-card" key={a.id}>
 {a.avatarFileId&&<img className="admin-photo" src={avatarUrl(a.avatarFileId)} alt="" loading="lazy"/>}
 <span className="eyebrow">{a.activeAdmin?'DOĞRULANMIŞ ADMIN':'ARTIK ADMIN DEĞİL'}</span><h2><Link to={'/admins/'+a.id}>{a.name}</Link></h2>
 <p>{a.universityName} · {a.departmentName}</p><p>{a.educationStatus==='MEZUN'?`${a.graduationYear} Mezunu`:'Üniversite Öğrencisi'}</p><p>{a.answerCount} görünür Admin cevabı</p>
 <Link className="text-link" to={'/questions?adminId='+encodeURIComponent(a.id)}>Cevapladığı soruları keşfet</Link></article>)}</div>
 {result.items.length===0&&<div className="question-empty"><h2>Admin bulunamadı.</h2></div>}
 <nav className="pagination" aria-label="Admin arama sayfaları"><button disabled={result.page===0} onClick={()=>page(result.page-1)}>Önceki sayfa</button><span>{result.totalElements} kişi · Sayfa {result.page+1}</span><button disabled={(result.page+1)*result.size>=result.totalElements} onClick={()=>page(result.page+1)}>Sonraki sayfa</button></nav></>
}
