import { useEffect,useState } from 'react'
import { Link,Navigate,useSearchParams } from 'react-router-dom'
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
 const [params,setParams]=useSearchParams(),scope=params.get('scope')??''
 const [quota,setQuota]=useState<Quota|null>(null),[profile,setProfile]=useState<Profile|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const c=new AbortController();Promise.all([getQuota(c.signal),getProfile(c.signal)]).then(([q,p])=>{if(!c.signal.aborted){setQuota(q);setProfile(p)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[revision])
 return <section className="management-page admin-panel-page">
 <header className="admin-panel-hero"><div><span className="eyebrow">DOĞRULANMIŞ DENEYİMLER</span><h1>Admin yorumlarım</h1><p>Soruları keşfet, deneyimini paylaş ve yayınladığın yorumları yönet.</p></div>
 {quota?<div className={`admin-quota-card ${quota.activeAdmin?'':'is-inactive'}`} role="status"><span>Bugün kalan</span><strong>{quota.activeAdmin?quota.remaining:'—'}</strong><small>{quota.activeAdmin?`${quota.limit} yorum hakkından`:'Admin yetkisi gerekli'}</small></div>:!error&&<div className="admin-quota-card" role="status"><span>Yorum hakkı</span><small>Yükleniyor…</small></div>}</header>
 <AuthFormError error={error}/>{error&&<button className="button button-secondary" onClick={()=>{setError(null);setRevision(r=>r+1)}}>Tekrar dene</button>}
 <nav className="admin-panel-actions" aria-label="Admin işlemleri"><Link className="admin-action-primary" to="/questions"><strong>Soruları keşfet</strong><span>Filtrele ve yorumlayabileceğin soruları bul.</span></Link><Link to="/popular"><strong>Popüler sorular</strong><span>En çok ilgi gören sorulara göz at.</span></Link>
 {profile?.education&&<><Link to={'/questions?universityId='+profile.education.universityId}><strong>Üniversitemin soruları</strong><span>Kendi üniversiten hakkındaki sorular.</span></Link><Link to={'/questions?universityId='+profile.education.universityId+'&universityDepartmentId='+profile.education.id}><strong>Bölümümün soruları</strong><span>Bölümüne özel soruları görüntüle.</span></Link></>}
 <Link to="/my-answers"><strong>Topluluk yorumlarım</strong><span>Üye olarak yazdığın yorumları yönet.</span></Link><Link to="/profile"><strong>Profilimi düzenle</strong><span>Profil ve eğitim bilgilerini güncelle.</span></Link>{quota?.activeAdmin&&<Link to={'/admins/'+id}><strong>Herkese açık profilim</strong><span>Profilinin ziyaretçilere görünen halini aç.</span></Link>}</nav>
 <section className="admin-history"><div className="admin-history-heading"><div><span className="eyebrow">YORUM GEÇMİŞİ</span><h2>Yayınladığım Admin yorumları</h2></div><div className="history-scope-filter"><label>Kapsam<select value={scope} onChange={e=>{const p=new URLSearchParams();if(e.target.value)p.set('scope',e.target.value);setParams(p)}}><option value="">Tümü</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite ve bölüm</option></select></label></div></div><AdminAnswerFeed key={scope} path={`/api/me/admin-answers${scope?`?scope=${scope}`:''}`} showQuestion/></section><Link className="button button-secondary account-back-button" to="/account">Hesabıma dön</Link></section>
}
