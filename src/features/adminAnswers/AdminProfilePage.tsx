import { ProfileLinks } from '../profile/PublicProfilePopup'
import { useEffect,useState } from 'react'
import { Link,useParams } from 'react-router-dom'
import { getAdmin,avatarUrl,type AdminProfile } from './adminAnswerApi'
import { AdminAnswerFeed } from './AdminAnswerFeed'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
export function AdminProfilePage(){const {id=''}=useParams();return <ProfileLoader key={id} id={id}/>}
function ProfileLoader({id}:{id:string}){
 const [profile,setProfile]=useState<AdminProfile|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const c=new AbortController();getAdmin(id,c.signal).then(p=>{if(!c.signal.aborted)setProfile(p)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[id,revision])
 if(error)return <section className="status-page"><h1>Profil yüklenemedi.</h1><AuthFormError error={error}/><button onClick={()=>{setError(null);setRevision(r=>r+1)}}>Tekrar dene</button></section>
 if(!profile)return <section className="status-page" role="status">Admin profili yükleniyor…</section>
 const p=profile
 return <section className="profile-page"><Link to="/questions">← Sorulara dön</Link><div className="profile-heading">{p.avatarFileId&&<img className="profile-photo" src={avatarUrl(p.avatarFileId)} alt=""/>}<div><span className="eyebrow">{p.activeAdmin?'DOĞRULANMIŞ ADMIN':'ARTIK ADMIN DEĞİL'}</span><h1>{p.name}</h1><p>{p.universityName} · {p.departmentName}</p><p>{p.educationStatus==='MEZUN'?`${p.graduationYear} Mezunu`:'Üniversite Öğrencisi'}</p></div></div>
 {!p.activeAdmin&&<p>Bu profil geçmiş doğrulama bilgilerini gösterir. Kişinin güncel Admin yetkisi yoktur.</p>}
 {(p.occupation||p.company)&&<p>{p.occupation} {p.company&&'· '+p.company} <small>(güncel kişisel beyan)</small></p>}
 {p.biography&&<p className="answer-body">{p.biography}</p>}<ProfileLinks linkedinUrl={p.linkedinUrl} portfolioUrl={p.portfolioUrl}/><h2>Cevapladığı sorular</h2><p>{p.answerCount} görünür Admin cevabı</p><AdminAnswerFeed path={'/api/admins/'+id+'/answers'} showQuestion/></section>
}

