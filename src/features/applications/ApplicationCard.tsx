import { useState } from 'react'
import { ProfileTrigger } from '../profile/PublicProfilePopup'
import type { Application } from './applicationApi'
import { decide, revoke } from './applicationApi'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
const labels={PENDING:'İnceleme bekliyor',APPROVED:'Onaylandı',REJECTED:'Reddedildi'}
export function ApplicationCard({application:a,manager,reload}:{application:Application;manager:boolean;reload:()=>void}){
 const [action,setAction]=useState<'APPROVED'|'REJECTED'|'REVOKE'|null>(null)
 const [reason,setReason]=useState(''),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null)
 async function confirm(){if(!action||pending)return;setPending(true);setError(null);try{if(action==='REVOKE')await revoke(a,reason);else await decide(a,action,reason);setAction(null);reload()}catch(e){setError(formError(e))}finally{setPending(false)}}
 return <article className="auth-card application-card"><div><span className="eyebrow">{labels[a.status]}</span><h2>{manager?<ProfileTrigger id={a.applicantId} name={`${a.firstName} ${a.lastName}`} detailHref={`/manager/users/${a.applicantId}`}/>:<>{a.firstName} {a.lastName}</>}</h2>
 {a.universityName&&a.departmentName&&<p>{a.universityName} · {a.departmentName}</p>}<p>{a.educationStatus==='YKS_ADAYI'?'YKS Adayı':a.educationStatus==='MEZUN'?`${a.graduationYear} Mezunu`:'Üniversite Öğrencisi'}</p>
 {(a.occupation||a.company)&&<p>{a.occupation} {a.company&&`· ${a.company}`} <small>(kişisel beyan)</small></p>}<div className="application-note application-cover-letter"><strong>Ön yazı:</strong><p>{a.coverLetter}</p></div>
 <p>Başvuru tarihi: <time dateTime={a.submittedAt}>{new Date(a.submittedAt).toLocaleString('tr-TR')}</time></p>
 {a.reviewedAt&&<p>{a.status==='APPROVED'?'Onay tarihi':'Karar tarihi'}: <time dateTime={a.reviewedAt}>{new Date(a.reviewedAt).toLocaleString('tr-TR')}</time></p>}
 {a.status==='APPROVED'&&!a.activeVerification&&<p className="application-reason" role="status">Admin yetkin kaldırıldı.</p>}
 {a.rejectionReason&&<div className="application-note application-reason"><strong>Ret gerekçesi:</strong><p>{a.rejectionReason}</p></div>}</div>
 {manager&&!action&&<div className="application-actions">{a.status==='PENDING'&&<><button className="button" disabled={pending} onClick={()=>setAction('APPROVED')}>Kabul et</button><button className="button button-secondary" disabled={pending} onClick={()=>setAction('REJECTED')}>Reddet</button></>}{a.activeVerification&&<button className="button button-secondary" disabled={pending} onClick={()=>setAction('REVOKE')}>Admin yetkisini kaldır</button>}</div>}
 {action&&<form onSubmit={e=>{e.preventDefault();void confirm()}}><p>{action==='APPROVED'?'Yukarıdaki eğitim ve profil bilgilerini kontrol ettin mi? Onay, Admin yetkisi verir.':action==='REVOKE'?'Admin yetkisi kaldırılacak ve bekleyen başvuru gerekçesiyle reddedilecek.':'Ret gerekçesi başvuru sahibine gösterilecek.'}</p>
 {action!=='APPROVED'&&<><label htmlFor={`reason-${a.id}`}>Gerekçe</label><textarea id={`reason-${a.id}`} required maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} disabled={pending}/></>}
 <div className="application-actions"><button className="button" disabled={pending}>{pending?'Kaydediliyor…':'Kararı onayla'}</button><button type="button" className="button button-secondary" disabled={pending} onClick={()=>setAction(null)}>Vazgeç</button></div></form>}
 <AuthFormError error={error}/>{error?.status===409&&<button className="button" onClick={reload}>Güncel listeyi yükle</button>}
 </article>
}
