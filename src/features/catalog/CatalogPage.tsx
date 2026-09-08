import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { CatalogEditor } from './CatalogEditor'
import { EducationEditor } from './EducationEditor'
import type { Kind } from './catalogApi'
import { BulkCatalogImport } from './BulkCatalogImport'
import { BulkTagImport } from './BulkTagImport'
import { useState } from 'react'
const tabs:Record<string,string>={UNIVERSITY:'Üniversiteler',DEPARTMENT:'Bölümler',TAG:'Tagler',EDUCATION:'Üniversite–bölüm eşleşmeleri'}
export function CatalogPage({admin=false,tags=false}:{admin?:boolean;tags?:boolean}){
  const auth=useAuth()
  const [params,setParams]=useSearchParams()
  const [revision,setRevision]=useState(0)
  const tab=admin||tags?'TAG':params.get('tab')??'EDUCATION'
  const selected=Object.hasOwn(tabs,tab)?tab:'UNIVERSITY'
  if(auth.status==='loading')return <section className="status-page" role="status">Hesabın yükleniyor…</section>
  if(auth.status==='error')return <section className="status-page"><h1>Hesabına ulaşılamadı.</h1><button className="button" onClick={auth.reload}>Tekrar dene</button></section>
  if(!auth.user)return <Navigate to="/login" replace/>
  if(auth.user.role!=='MANAGER' && !(admin && auth.user.role==='ADMIN'))return <section className="status-page"><h1>Bu sayfaya erişim iznin yok.</h1><Link to="/account">Hesabıma dön</Link></section>
  if(admin && !auth.user.profileCompleted && auth.user.role!=='MANAGER')return <section className="status-page"><h1>Önce profilini tamamla.</h1><Link className="button" to="/profile">Profilini tamamla</Link></section>
  return <section className="management-page"><span className="eyebrow">{admin?'ADMIN':'MANAGER'} PANEL</span><h1>{admin?'Yeni konular ekle.':tags?'Tagler':'Üniversiteler ve Bölümler'}</h1>


    {!admin && !tags && <nav className="catalog-tabs" aria-label="Katalog bölümleri">{Object.entries(tabs).filter(([value])=>value!=='TAG').map(([value,label])=><button key={value} type="button" aria-current={selected===value?'page':undefined} onClick={()=>setParams({tab:value})}>{label}</button>)}</nav>}
    {!admin&&!tags&&<div className="auth-card"><BulkCatalogImport completed={()=>setRevision(r=>r+1)}/></div>}
    {!admin&&tags&&<div className="auth-card"><BulkTagImport completed={()=>setRevision(r=>r+1)}/></div>}
    <div className="auth-card">{selected==='EDUCATION'?<EducationEditor key={`${selected}-${revision}`}/>:<CatalogEditor key={`${selected}-${revision}`} kind={selected as Kind} admin={admin}/>}</div>
    <Link className="back-link" to="/account">Hesabıma dön</Link>
  </section>
}
