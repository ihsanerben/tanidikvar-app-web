import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
import { listApplications, type Applications } from './applicationApi'
import { ApplicationCard } from './ApplicationCard'
import { ApplicationForm } from './ApplicationForm'
export function ApplicationsPage({manager=false}:{manager?:boolean}){
 const auth=useAuth()
 if(auth.status==='loading')return <section className="status-page" role="status">Hesap yükleniyor…</section>
 if(auth.status==='error')return <section className="status-page"><h1>Hesaba ulaşılamadı.</h1><button className="button" onClick={auth.reload}>Tekrar dene</button></section>
 if(!auth.user)return <Navigate to="/login" replace/>
 if(manager&&auth.user.role!=='MANAGER')return <section className="status-page"><h1>Manager yetkisi gerekiyor.</h1></section>
 return <ApplicationsList key={auth.user.id+manager} manager={manager} canApply={auth.user.role!=='MANAGER'}/>
}
function ApplicationsList({manager,canApply}:{manager:boolean;canApply:boolean}){
 const [data,setData]=useState<Applications|null>(null),[error,setError]=useState<ApiError|null>(null),[page,setPage]=useState(0),[status,setStatus]=useState(manager?'PENDING':''),[revision,setRevision]=useState(0),[saved,setSaved]=useState(false)
 useEffect(()=>{const c=new AbortController();listApplications(manager,page,status,c.signal).then(v=>{if(!c.signal.aborted)setData(v)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[manager,page,status,revision])
 function reload(){setData(null);setError(null);setRevision(revision+1)}
 const pending=data?.items.some(a=>a.status==='PENDING')
 return <section className="profile-page"><div className="profile-heading"><div><span className="eyebrow">{manager?'MANAGER PANEL':'DOĞRULANMIŞ DENEYİMLER'}</span><h1>{manager?'Admin başvuruları':'Başvurularım'}</h1><p>Üniversite deneyimini doğrula, adayların sorularına katkı sun.</p><Link to={manager?'/manager':'/profile'}>{manager?'Katalog yönetimi':'Profilime dön'}</Link></div></div>
 {manager&&<div className="auth-card"><label htmlFor="application-status">Başvuru durumu</label><select id="application-status" value={status} onChange={e=>{setStatus(e.target.value);setPage(0);setData(null);setError(null)}}><option value="PENDING">İnceleme bekliyor</option><option value="APPROVED">Onaylandı</option><option value="REJECTED">Reddedildi</option><option value="">Tümü</option></select></div>}
 {saved&&<p role="status">Başvurun alındı. Manager incelemesini burada takip edebilirsin.</p>}
 {error?<div className="auth-card"><AuthFormError error={error}/><button className="button" onClick={reload}>Tekrar dene</button></div>:!data?<p role="status">Başvurular yükleniyor…</p>:<><div className="application-list">{data.items.length===0?<p>Henüz başvuru yok.</p>:data.items.map(a=><ApplicationCard key={a.id+'-'+a.version+'-'+a.activeVerification} application={a} manager={manager} reload={reload}/>)}</div>
 <nav className="application-actions" aria-label="Başvuru sayfaları"><button className="button button-secondary" disabled={page===0} onClick={()=>{setPage(page-1);setData(null)}}>Önceki</button><span>Sayfa {page+1} · {data.totalElements} başvuru</span><button className="button button-secondary" disabled={(page+1)*data.size>=data.totalElements} onClick={()=>{setPage(page+1);setData(null)}}>Sonraki</button></nav>
 {!manager&&canApply&&page===0&&!pending&&<ApplicationForm onSaved={()=>{setSaved(true);reload()}}/>}</>}
 </section>
}

