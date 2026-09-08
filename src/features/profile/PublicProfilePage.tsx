import { useEffect,useState } from 'react'
import { Link,useParams } from 'react-router-dom'
import { apiGet,ApiError } from '../../api/apiClient'
import { pageOf,type Page } from '../catalog/catalogApi'
import { answer,type Answer } from '../answers/answerApi'
import { adminAnswer,type AdminAnswer } from '../adminAnswers/adminAnswerApi'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { AdminStars,ProfileAvatar } from './ProfileAvatar'
import { ProfileLinks,publicProfile,type PublicProfile } from './PublicProfilePopup'
import { roleLabels } from './useProfileSummary'
import { questionDate } from '../questions/questionApi'

export function PublicProfilePage(){
 const {id=''}=useParams()
 return <PublicProfileLoader key={id} id={id}/>
}
function PublicProfileLoader({id}:{id:string}){
 const [profile,setProfile]=useState<PublicProfile|null>(null),[community,setCommunity]=useState<Page<Answer>|null>(null),[admin,setAdmin]=useState<Page<AdminAnswer>|null>(null),[communityPage,setCommunityPage]=useState(0),[adminPage,setAdminPage]=useState(0),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const c=new AbortController();Promise.all([apiGet(`/api/profiles/${encodeURIComponent(id)}`,c.signal).then(publicProfile),apiGet(`/api/profiles/${encodeURIComponent(id)}/comments/community?page=${communityPage}&size=20`,c.signal).then(v=>pageOf(v,answer)),apiGet(`/api/profiles/${encodeURIComponent(id)}/comments/admin?page=${adminPage}&size=20`,c.signal).then(v=>pageOf(v,adminAnswer))]).then(([p,communityItems,adminItems])=>{if(!c.signal.aborted){setProfile(p);setCommunity(communityItems);setAdmin(adminItems);setError(null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[id,revision,communityPage,adminPage])
 if(error)return <section className="profile-page public-profile-page"><Link className="back-link" to="/questions">← Sorulara dön</Link><h1>Profil yüklenemedi.</h1><AuthFormError error={error}/><button className="button" onClick={()=>setRevision(v=>v+1)}>Tekrar dene</button></section>
 if(!profile||!community||!admin)return <section className="profile-page public-profile-page" role="status">Profil yükleniyor…</section>
 const hasDetails=Boolean(profile.graduationYear||profile.occupation||profile.company)
 return <section className="profile-page public-profile-page"><Link className="back-link" to="/questions">← Sorulara dön</Link><div className="profile-heading public-profile-hero"><div className={`public-profile-avatar ${profile.role==='ADMIN'?'is-admin':''}`}><ProfileAvatar fileId={profile.avatarFileId} name={profile.name} decorated={false}/>{profile.role==='ADMIN'&&<span className="public-profile-admin-stars" aria-label="Admin"><AdminStars educationStatus={profile.educationStatus}/></span>}</div><div><h1>{profile.name}</h1><p>{profile.universityName}{profile.departmentName&&` · ${profile.departmentName}`}</p><p className="public-profile-role">{roleLabels[profile.educationStatus]??profile.educationStatus}{profile.role==='ADMIN'&&<span>Admin</span>}</p></div></div>{hasDetails&&<dl className="account-summary public-profile-details">{profile.graduationYear&&<div><dt>Mezuniyet yılı</dt><dd>{profile.graduationYear}</dd></div>}{profile.occupation&&<div><dt>Meslek</dt><dd>{profile.occupation}</dd></div>}{profile.company&&<div><dt>Şirket</dt><dd>{profile.company}</dd></div>}</dl>}{profile.biography&&<p className="profile-biography">{profile.biography}</p>}<ProfileLinks linkedinUrl={profile.linkedinUrl} portfolioUrl={profile.portfolioUrl}/><ProfileCommentSection title="Admin yorumları" data={admin} type="admin" onPage={setAdminPage}/><ProfileCommentSection title="Topluluk yorumları" data={community} type="community" onPage={setCommunityPage}/></section>
}

function ProfileCommentSection({title,data,type,onPage}:{title:string;data:Page<Answer>|Page<AdminAnswer>;type:'community'|'admin';onPage:(page:number)=>void}){const {items,page,size,totalElements}=data;return <section className="profile-comments"><h2>{title}</h2>{items.length===0?<p>Henüz görünür yorum yok.</p>:items.map(item=><article className="answer-card profile-comment-card" key={item.id}>{type==='admin'&&<h3>{(item as AdminAnswer).questionTitle}</h3>}<span className={`comment-kind ${type}`}>{type==='admin'?'Admin yorumu':'Topluluk yorumu'}</span><p className="answer-body">{item.body}</p><div className="profile-comment-footer"><time dateTime={item.publishedAt}>{questionDate(item.publishedAt)}</time><Link className="button button-secondary" to={`/questions/${item.questionId}?tab=${type}#yorum-${item.id}`}>Soru detayı</Link></div></article>)}{totalElements>size&&<nav className="pagination" aria-label={`${title} sayfaları`}><button type="button" disabled={page===0} onClick={()=>onPage(page-1)}>Önceki</button><span>Sayfa {page+1}</span><button type="button" disabled={(page+1)*size>=totalElements} onClick={()=>onPage(page+1)}>Sonraki</button></nav>}</section>}
