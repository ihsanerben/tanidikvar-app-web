import { useEffect,useRef,useState } from 'react'
import { apiGet,ApiError,isRecord } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { ProfileAvatar } from './ProfileAvatar'
import { roleLabels } from './useProfileSummary'
interface PublicProfile {id:string;name:string;role:string;educationStatus:string;universityName:string|null;departmentName:string|null;graduationYear:number|null;biography:string|null;occupation:string|null;company:string|null;linkedinUrl:string|null;portfolioUrl:string|null;avatarFileId:string|null}
function parse(value:unknown):PublicProfile {
 if(!isRecord(value)||!['id','name','role','educationStatus'].every(k=>typeof value[k]==='string')||!['universityName','departmentName','biography','occupation','company','linkedinUrl','portfolioUrl','avatarFileId'].every(k=>value[k]===null||typeof value[k]==='string')||!(value.graduationYear===null||typeof value.graduationYear==='number'))throw new ApiError(200,'INVALID_RESPONSE','Profil bilgileri alınamadı.')
 return value as unknown as PublicProfile
}
function external(value:string|null|undefined){if(!value)return null;try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null}}
export function ProfileLinks({linkedinUrl,portfolioUrl}:{linkedinUrl?:string|null;portfolioUrl?:string|null}){
 const linkedin=external(linkedinUrl),portfolio=external(portfolioUrl)
 return <div className="profile-links">{linkedin&&<a className="button button-secondary" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{portfolio&&<a className="button button-secondary" href={portfolio} target="_blank" rel="noopener noreferrer">Portfolyo ↗</a>}</div>
}
export function ProfileTrigger({id,name,avatarFileId}:{id:string|null;name:string;avatarFileId?:string|null}){
 const [open,setOpen]=useState(false)
 if(!id)return <span className="profile-trigger"><ProfileAvatar fileId={avatarFileId??null} name={name} className="answer-avatar"/>{name}</span>
 return <><button type="button" className="profile-trigger" aria-label={name+' profilini görüntüle'} onClick={()=>setOpen(true)}><ProfileAvatar fileId={avatarFileId??null} name={name} className="answer-avatar"/>{name}</button>{open&&<PublicProfilePopup key={id} id={id} close={()=>setOpen(false)}/>}</>
}
function PublicProfilePopup({id,close}:{id:string;close:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),[profile,setProfile]=useState<PublicProfile|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,reload]=useState(0)
 useEffect(()=>{const d=dialog.current!;d.setAttribute('open','');return()=>d.removeAttribute('open')},[])
 useEffect(()=>{const c=new AbortController();apiGet('/api/profiles/'+id,c.signal).then(parse).then(p=>{if(!c.signal.aborted){setProfile(p);setError(null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[id,revision])
 return <dialog ref={dialog} className="public-profile-dialog" aria-labelledby="public-profile-title" onKeyDown={e=>{if(e.key==='Escape'){if(typeof dialog.current?.close==='function')dialog.current.close();else close()}}} onClose={close}><button type="button" className="profile-close" aria-label="Profili kapat" onClick={()=>{if(typeof dialog.current?.close==='function')dialog.current.close();else close()}}>×</button><h2 id="public-profile-title">{profile?.name??'Profil'}</h2>
 {error?<><AuthFormError error={error}/><button onClick={()=>{setError(null);reload(r=>r+1)}}>Tekrar dene</button></>:!profile?<p role="status">Profil yükleniyor…</p>:<><ProfileAvatar fileId={profile.avatarFileId} name={profile.name}/><p className="profile-role">{roleLabels[profile.role]??profile.role}</p><dl className="account-summary"><div><dt>Eğitim durumu</dt><dd>{roleLabels[profile.educationStatus]??profile.educationStatus}</dd></div>{profile.universityName&&<div><dt>Üniversite</dt><dd>{profile.universityName}</dd></div>}{profile.departmentName&&<div><dt>Bölüm</dt><dd>{profile.departmentName}</dd></div>}{profile.graduationYear&&<div><dt>Mezuniyet yılı</dt><dd>{profile.graduationYear}</dd></div>}{profile.occupation&&<div><dt>Meslek</dt><dd>{profile.occupation}</dd></div>}{profile.company&&<div><dt>Şirket</dt><dd>{profile.company}</dd></div>}</dl>{profile.biography&&<p className="profile-biography">{profile.biography}</p>}<ProfileLinks linkedinUrl={profile.linkedinUrl} portfolioUrl={profile.portfolioUrl}/></>}
 </dialog>
}
