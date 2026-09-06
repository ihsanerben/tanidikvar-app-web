import { ProfileLinks } from '../profile/PublicProfilePopup'
import { OwnProfileAvatar } from '../profile/ProfileAvatar'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from './useAuth'
import { AuthFormError } from './AuthFormError'
import { formError } from './formError'
import { useProfileSummary,roleLabels } from '../profile/useProfileSummary'
export function AccountPage({status=false}:{status?:boolean}) {
 const auth=useAuth()
 if(auth.status==='loading')return <section className="status-page" role="status">Hesabın yükleniyor…</section>
 if(auth.status==='error')return <section className="status-page"><h1>Hesabına ulaşılamadı.</h1><button className="button" onClick={auth.reload}>Tekrar dene</button></section>
 if(!auth.user)return <Navigate to="/login" replace/>
 return <Account key={auth.user.id} status={status}/>
}
function Account({status}:{status:boolean}){
 const auth=useAuth(),{profile,error,reload}=useProfileSummary(auth.user!.id)
 const [failure,setFailure]=useState<ApiError|null>(null)
 const user=auth.user!
 return <section className="account-page"><h1>{status?'Hesap durumu':'Hesabım'}</h1>
 <div className="auth-card">{status?<><ul className="account-status-list"><li><span>E-posta doğrulama</span><strong className="status-badge">Tamamlandı</strong></li><li><span>Profil tamamlama</span><strong className={`status-badge ${user.profileCompleted?'':'status-pending'}`}>{user.profileCompleted?'Tamamlandı':'Eksik'}</strong></li></ul>
 {!user.profileCompleted&&<Link className="button" to="/profile">Profilini tamamla</Link>}<Link className="button button-secondary" to="/account">Hesabıma dön</Link></>:<>
 {error?<><AuthFormError error={error}/><button className="button" onClick={reload}>Bilgileri yeniden yükle</button></>:!profile?<p role="status">Bilgiler yükleniyor…</p>:<><div className="account-profile-overview"><div className="account-photo"><OwnProfileAvatar name={[profile.firstName,profile.lastName].filter(Boolean).join(' ')} isAdmin={user.role==='ADMIN'}/></div><div className="account-contact"><strong>{[profile.firstName,profile.lastName].filter(Boolean).join(' ')||'—'}</strong><span>{user.email}</span></div></div><dl className={`account-summary role-${profile.educationStatus??"USER"}`}>
 <div><dt>Üniversite</dt><dd>{profile.education?.universityName||'—'}</dd></div><div><dt>Bölüm</dt><dd>{profile.education?.departmentName||'—'}</dd></div><div><dt>Rol</dt><dd>{roleLabels[profile.educationStatus??user.role]||profile.educationStatus||'—'}</dd></div></dl><ProfileLinks linkedinUrl={profile.linkedinUrl} portfolioUrl={profile.portfolioUrl}/></>}
 <nav className="account-actions" aria-label="Hesap işlemleri"><Link className="button button-secondary" to="/profile">{user.profileCompleted?'Profilimi düzenle':'Profilini tamamla'}</Link><Link className="button button-secondary" to="/account/status">Hesap durumu</Link>
 <Link className="button button-secondary" to="/my-answers">Topluluk yorumlarım</Link>
 <Link className="button button-secondary" to="/my-questions">Sorularım</Link>
 {user.role==='MANAGER'&&<Link className="button button-secondary" to="/manager">Manager Panel</Link>}
 {user.role==='ADMIN'&&<Link className="button button-secondary" to="/admin">Admin yorumlarım</Link>}
 {<Link className="button button-secondary" to={user.role==='MANAGER'?'/manager/applications':'/applications'}>{user.role==='MANAGER'?'Admin başvurularını incele':'Admin başvurularım'}</Link>}</nav>
 <AuthFormError error={failure}/><button className="button button-danger account-logout" onClick={()=>{setFailure(null);void auth.logout().catch(e=>setFailure(formError(e)))}}>Çıkış yap</button></>}
 </div></section>
}
