import { useEffect,useState } from 'react'
import { Link,useSearchParams } from 'react-router-dom'
import { listAdmins,type AdminProfile } from '../adminAnswers/adminAnswerApi'
import { ProfileAvatar } from '../profile/ProfileAvatar'
import type { Page } from '../catalog/catalogApi'
import type { ApiError } from '../../api/apiClient'
import { formError } from '../auth/formError'
import { AuthFormError } from '../auth/AuthFormError'
import { SearchForm } from './SearchForm'
export function AdminDirectoryPage(){
 const [params,setParams]=useSearchParams(),[revision,retry]=useState(0),[filtersOpen,setFiltersOpen]=useState(false)
 const query=params.toString()
 function filter(key:string,value:string|null){const next=new URLSearchParams(params);next.delete('page');if(value)next.set(key,value);else next.delete(key);setParams(next)}
 return <section className="questions-page"><div className="questions-heading"><div><h1>Adminler</h1></div></div>
 <SearchForm label="Admin adı ara" value={params.get('q')??''} onSearch={q=>filter('q',q)} filterButton={<button type="button" className="button button-secondary filter-toggle" onClick={()=>setFiltersOpen(v=>!v)}>Filtrele</button>}/>
 {filtersOpen&&<div className="question-filters"><div className="auth-card admin-directory-filters"><label htmlFor="admin-status">Admin durumu</label><select id="admin-status" value={params.get('status')??''} onChange={e=>filter('status',e.target.value)}><option value="">Tüm Adminler</option><option value="ACTIVE">Aktif Adminler</option></select><button className="filter-clear-button" type="button" onClick={()=>setParams({})}>Filtreleri temizle</button></div></div>}
 <AdminResults key={query+':'+revision} query={query} activeOnly={params.get('status')==='ACTIVE'} retry={()=>retry(r=>r+1)} page={value=>{const next=new URLSearchParams(params);next.set('page',String(value));setParams(next)}}/>
 </section>
}
function AdminResults({query,activeOnly,retry,page}:{query:string;activeOnly:boolean;retry:()=>void;page:(value:number)=>void}){
 const [result,setResult]=useState<Page<AdminProfile>|null>(null),[error,setError]=useState<ApiError|null>(null)
 useEffect(()=>{const c=new AbortController();listAdmins(query,c.signal).then(data=>{if(!c.signal.aborted)setResult(data)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return ()=>c.abort()},[query])
 if(error)return <div className="auth-card"><AuthFormError error={error}/><button onClick={retry}>Tekrar dene</button></div>
 if(!result)return <p role="status">Adminler yükleniyor…</p>
 const admins=activeOnly?result.items.filter(a=>a.activeAdmin):result.items
 return <><div className="admin-directory">{admins.map(a=><Link className="admin-directory-card" to={'/profiles/'+a.id} key={a.id} aria-label={`${a.name} profilini aç`}>
 <ProfileAvatar fileId={a.avatarFileId} name={a.name} className="admin-photo" isAdmin={a.activeAdmin}/><div><h2>{a.name}</h2><p className="admin-directory-education">{a.universityName||'Üniversite bilgisi yok'}{a.departmentName&&` · ${a.departmentName}`}</p><span className="admin-directory-role">Admin</span><p className="admin-directory-counts"><strong>{a.answerCount}</strong> Admin yorumu <span>·</span> <strong>{a.communityAnswerCount}</strong> topluluk yorumu</p></div></Link>)}</div>
 {admins.length===0&&<div className="question-empty"><h2>Admin bulunamadı.</h2></div>}
 <nav className="pagination" aria-label="Admin arama sayfaları"><button disabled={result.page===0} onClick={()=>page(result.page-1)}>Önceki sayfa</button><span>{result.totalElements} kişi · Sayfa {result.page+1}</span><button disabled={(result.page+1)*result.size>=result.totalElements} onClick={()=>page(result.page+1)}>Sonraki sayfa</button></nav></>
}
