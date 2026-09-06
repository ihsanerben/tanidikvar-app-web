import { useEffect,useState } from 'react'
import { Link,Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { getProfile,type Profile } from '../profile/profileApi'
import type { ApiError } from '../../api/apiClient'
import { getQuota,listAssignments,type Quota,type Assignment } from './adminAnswerApi'
import type { Page } from '../catalog/catalogApi'
import { AdminAnswerFeed } from './AdminAnswerFeed'
export function AdminPanelPage(){
 const auth=useAuth()
 if(auth.status==='loading')return <section className="status-page" role="status">Hesap yükleniyor…</section>
 if(auth.status==='error')return <section className="status-page"><h1>Hesaba ulaşılamadı.</h1><button onClick={auth.reload}>Tekrar dene</button></section>
 if(!auth.user)return <Navigate to="/login" replace/>
 return <Panel key={auth.user.id+auth.user.role+auth.user.profileCompleted} id={auth.user.id}/>
}
function Panel({id}:{id:string}){
 const [quota,setQuota]=useState<Quota|null>(null),[profile,setProfile]=useState<Profile|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const c=new AbortController();Promise.all([getQuota(c.signal),getProfile(c.signal)]).then(([q,p])=>{if(!c.signal.aborted){setQuota(q);setProfile(p)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[revision])
 return <section className="management-page"><h1>Cevaplarım</h1>
 <AuthFormError error={error}/>{error&&<button onClick={()=>{setError(null);setRevision(r=>r+1)}}>Tekrar dene</button>}
 {quota?<p role="status">{quota.activeAdmin?`Kalan cevap hakkın: ${quota.remaining} / ${quota.limit}`:'Yeni Admin cevabı için güncel Admin yetkisi ve tamamlanmış profil gerekiyor.'}</p>:!error&&<p role="status">Cevap hakkın yükleniyor…</p>}
 <nav className="question-navigation"><Link className="button" to="/questions">Soruları keşfet ve filtrele</Link><Link to="/popular">Popüler sorular</Link>
 {profile?.education&&<><Link to={'/questions?universityId='+profile.education.universityId}>Üniversitemin soruları</Link><Link to={'/questions?universityId='+profile.education.universityId+'&universityDepartmentId='+profile.education.id}>Bölümümün soruları</Link></>}
 <Link to="/my-answers">Yorumlarım</Link><Link to="/profile">Profilimi düzenle</Link>{quota?.activeAdmin&&<><Link to={'/admins/'+id}>Herkese açık profilim</Link><Link to="/admin/tags">Tag yönetimi</Link></>}</nav>
 <h2>Cevaplayacaklarım</h2><Assignments/><h2>Admin cevaplarım</h2><AdminAnswerFeed path="/api/me/admin-answers" showQuestion/></section>
}
function Assignments(){
 const [page,setPage]=useState(0),[revision,setRevision]=useState(0)
 return <AssignmentList key={page+':'+revision} page={page} setPage={setPage} retry={()=>setRevision(r=>r+1)}/>
}
function AssignmentList({page,setPage,retry}:{page:number;setPage:(p:number)=>void;retry:()=>void}){
 const [data,setData]=useState<Page<Assignment>|null>(null),[error,setError]=useState<ApiError|null>(null)
 useEffect(()=>{const c=new AbortController();listAssignments(page,c.signal).then(v=>{if(!c.signal.aborted)setData(v)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[page])
 if(error)return <><AuthFormError error={error}/><button onClick={retry}>Atamaları yeniden yükle</button></>
 if(!data)return <p role="status">Atamalar yükleniyor…</p>
 return <><ul className="assignment-list">{data.items.map(a=><li key={a.questionId}><Link to={'/questions/'+a.questionId}>{a.questionTitle}</Link>{a.archivedAt&&<span> · Arşivlendi</span>}</li>)}</ul>{data.items.length===0&&<p>Henüz seçtiğin bir soru yok.</p>}
 <nav className="pagination" aria-label="Atama sayfaları"><button disabled={page===0} onClick={()=>setPage(page-1)}>Önceki atamalar</button><span>Sayfa {page+1}</span><button disabled={(page+1)*data.size>=data.totalElements} onClick={()=>setPage(page+1)}>Sonraki atamalar</button></nav></>
}
