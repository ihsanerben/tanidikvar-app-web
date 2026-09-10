import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProfile, type Profile } from '../profile/profileApi'
import { submitApplication } from './applicationApi'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { ApiError } from '../../api/apiClient'
export function ApplicationForm({onSaved}:{onSaved:()=>void}){
 const [profile,setProfile]=useState<Profile|null>(null),[error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false),[revision,setRevision]=useState(0)
 const request=useRef(crypto.randomUUID()),busy=useRef(false),[coverLetter,setCoverLetter]=useState('')
 useEffect(()=>{const c=new AbortController();getProfile(c.signal).then(p=>{if(!c.signal.aborted)setProfile(p)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[revision])
 function reload(){setError(null);setProfile(null);request.current=crypto.randomUUID();setRevision(revision+1)}
 if(!profile)return <div className="auth-card">{error?<><AuthFormError error={error}/><button className="button" onClick={reload}>Profili yeniden yükle</button></>:<p role="status">Profil yükleniyor…</p>}</div>
 const eligible=profile.educationStatus==='YKS_ADAYI'||(profile.educationStatus==='UNIVERSITE_OGRENCISI'&&profile.education!==null)||(profile.educationStatus==='MEZUN'&&profile.education!==null&&profile.graduationYear!==null)
 if(!eligible)return <div className="auth-card"><p>Admin başvurusu için eğitim bilgilerini tamamla.</p><Link to="/profile">Profilime git</Link></div>
 return <form className="auth-card" onSubmit={e=>{e.preventDefault();if(busy.current)return;busy.current=true;setPending(true);setError(null);void submitApplication(request.current,profile.version,coverLetter).then(onSaved).catch(e=>setError(formError(e))).finally(()=>{busy.current=false;setPending(false)})}}>
 <h2>Admin başvurusu</h2><p>{profile.firstName} {profile.lastName}{profile.education&&` · ${profile.education.universityName} · ${profile.education.departmentName}`}</p>
 <p>{profile.educationStatus==='YKS_ADAYI'?'YKS Adayı':profile.educationStatus==='MEZUN'?`${profile.graduationYear} Mezunu`:'Üniversite Öğrencisi'}</p>

 <p className="field-help">Başvurun eğitim ve profil bilgilerine göre incelenir. Gönderilen bilgiler sonradan değiştirilemez.</p><label htmlFor="application-cover-letter">Kısa ön yazı</label><textarea id="application-cover-letter" required minLength={20} maxLength={1000} rows={5} value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} placeholder="Kendini ve neden Admin olmak istediğini kısaca anlat."/><p className="field-help">20–1000 karakter · {coverLetter.length}/1000</p>
 <AuthFormError error={error}/>
 {error?.status===409&&<button type="button" className="button button-secondary" onClick={reload}>Güncel profili yükle</button>}
 <button className="button" disabled={pending}>{pending?'Gönderiliyor…':'Başvuruyu gönder'}</button></form>
}
