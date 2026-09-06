import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, type Profile } from '../profile/profileApi'
import { submitApplication } from './applicationApi'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { ApiError } from '../../api/apiClient'
export function ApplicationForm({onSaved}:{onSaved:()=>void}){
 const [profile,setProfile]=useState<Profile|null>(null),[file,setFile]=useState<File|null>(null),[error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false),[revision,setRevision]=useState(0)
 const request=useRef(crypto.randomUUID()),busy=useRef(false)
 useEffect(()=>{const c=new AbortController();getProfile(c.signal).then(p=>{if(!c.signal.aborted)setProfile(p)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[revision])
 function reload(){setError(null);setProfile(null);request.current=crypto.randomUUID();setRevision(revision+1)}
 if(!profile)return <div className="auth-card">{error?<><AuthFormError error={error}/><button className="button" onClick={reload}>Profili yeniden yükle</button></>:<p role="status">Profil yükleniyor…</p>}</div>
 if(!profile.completed||profile.educationStatus==='YKS_ADAYI')return <div className="auth-card"><p>Admin başvurusu için üniversite öğrencisi veya mezun profilini tamamla.</p><Link to="/profile">Profilime git</Link></div>
 return <form className="auth-card" onSubmit={e=>{e.preventDefault();if(!file||busy.current)return;if(file.size>10*1024*1024||!file.name.toLowerCase().endsWith('.pdf')){setError(new ApiError(400,'INVALID_FILE','En fazla 10 MB boyutunda PDF seç.'));return}busy.current=true;setPending(true);setError(null);void submitApplication(request.current,profile.version,file).then(onSaved).catch(e=>setError(formError(e))).finally(()=>{busy.current=false;setPending(false)})}}>
 <h2>Admin başvurusu</h2><p>{profile.firstName} {profile.lastName} · {profile.education?.universityName} · {profile.education?.departmentName}</p>
 <p>{profile.educationStatus==='MEZUN'?`${profile.graduationYear} Mezunu`:'Üniversite Öğrencisi'}</p>

 <label htmlFor="document">e-Devlet öğrenci / mezun belgesi</label><input id="document" type="file" accept=".pdf,application/pdf" required disabled={pending} onChange={e=>{setFile(e.target.files?.[0]??null);request.current=crypto.randomUUID()}}/>
 <AuthFormError error={error}/>
 {error?.status===409&&<button type="button" className="button button-secondary" onClick={reload}>Güncel profili yükle</button>}
 <button className="button" disabled={pending}>{pending?'Gönderiliyor…':'Başvuruyu gönder'}</button></form>
}

