import { useEffect,useState } from 'react'
import { Link,Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { getProfile,type Profile } from '../profile/profileApi'
import type { ApiError } from '../../api/apiClient'
import { getQuota,type Quota } from './adminAnswerApi'
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
 return <section className="management-page"><h1>Admin yorumlarım</h1>
 <AuthFormError error={error}/>{error&&<button onClick={()=>{setError(null);setRevision(r=>r+1)}}>Tekrar dene</button>}
 {quota?<p role="status">{quota.activeAdmin?`Kalan yorum hakkın: ${quota.remaining} / ${quota.limit}`:'Yeni Admin yorumu için güncel Admin yetkisi ve tamamlanmış profil gerekiyor.'}</p>:!error&&<p role="status">Yorum hakkın yükleniyor…</p>}
 <nav className="question-navigation"><Link className="button" to="/questions">Soruları keşfet ve filtrele</Link><Link to="/popular">Popüler sorular</Link>
 {profile?.education&&<><Link to={'/questions?universityId='+profile.education.universityId}>Üniversitemin soruları</Link><Link to={'/questions?universityId='+profile.education.universityId+'&universityDepartmentId='+profile.education.id}>Bölümümün soruları</Link></>}
 <Link to="/my-answers">Yorumlarım</Link><Link to="/profile">Profilimi düzenle</Link>{quota?.activeAdmin&&<Link to={'/admins/'+id}>Herkese açık profilim</Link>}</nav>
 <AdminAnswerFeed path="/api/me/admin-answers" showQuestion/><Link className="button button-secondary account-back-button" to="/account">Hesabıma dön</Link></section>
}
