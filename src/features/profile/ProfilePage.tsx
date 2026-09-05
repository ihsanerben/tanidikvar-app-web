import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { useAuth } from '../auth/useAuth'
import { RemotePicker } from '../catalog/RemotePicker'
import type { Choice } from '../catalog/catalogApi'
import { getProfile, saveProfile, statusLabels, type Profile, type EducationStatus } from './profileApi'

export function ProfilePage() {
  const auth=useAuth()
  if(auth.status==='loading') return <section className="status-page" role="status">Hesabın yükleniyor…</section>
  if(auth.status==='error') return <section className="status-page"><h1>Hesabına ulaşılamadı.</h1><button className="button" onClick={auth.reload}>Tekrar dene</button></section>
  if(!auth.user) return <Navigate to="/login" replace />
  return <ProfileLoader key={auth.user.id} />
}
function ProfileLoader(){
  const [profile,setProfile]=useState<Profile|null>(null)
  const [error,setError]=useState<ApiError|null>(null)
  const [revision,setRevision]=useState(0)
  useEffect(()=>{
    const controller=new AbortController()
    getProfile(controller.signal).then(value=>{if(!controller.signal.aborted)setProfile(value)}).catch(reason=>{if(!controller.signal.aborted)setError(formError(reason))})
    return ()=>controller.abort()
  },[revision])
  if(error) return <section className="status-page"><h1>Profil yüklenemedi.</h1><AuthFormError error={error}/><button className="button" onClick={()=>{setError(null);setRevision(revision+1)}}>Tekrar dene</button></section>
  if(!profile) return <section className="status-page" role="status">Profil yükleniyor…</section>
  return <ProfileForm key={profile.version} initial={profile} reload={()=>{setProfile(null);setRevision(revision+1)}}/>
}
function ProfileForm({initial,reload}:{initial:Profile;reload:()=>void}){
  const auth=useAuth()
  const [firstName,setFirst]=useState(initial.firstName??'')
  const [lastName,setLast]=useState(initial.lastName??'')
  const [status,setStatus]=useState<EducationStatus>(initial.educationStatus??'YKS_ADAYI')
  const [university,setUniversity]=useState<Choice|null>(initial.education?{id:initial.education.universityId,label:initial.education.universityName}:null)
  const [department,setDepartment]=useState<Choice|null>(initial.education?{id:initial.education.id,label:initial.education.departmentName}:null)
  const [year,setYear]=useState(initial.graduationYear?.toString()??'')
  const [biography,setBiography]=useState(initial.biography??'')
  const [occupation,setOccupation]=useState(initial.occupation??'')
  const [company,setCompany]=useState(initial.company??'')
  const [version,setVersion]=useState(initial.version)
  const [pending,setPending]=useState(false)
  const [saved,setSaved]=useState(false)
  const [error,setError]=useState<ApiError|null>(null)
  const submitting=useRef(false)
  const form=useRef<HTMLFormElement>(null)
  async function submit(event:FormEvent){
    event.preventDefault();if(submitting.current)return
    submitting.current=true;setPending(true);setError(null);setSaved(false)
    try{
      const result=await saveProfile({firstName,lastName,educationStatus:status,universityDepartmentId:status==='YKS_ADAYI'?null:department?.id??null,
        graduationYear:status==='MEZUN' && year?Number(year):null,biography,occupation,company,version})
      setVersion(result.version);setSaved(true)
      if(auth.user) auth.setUser({...auth.user,profileCompleted:result.completed,role:['ADMIN','MANAGER'].includes(auth.user.role)?auth.user.role:result.educationStatus??'USER'})
    }catch(reason){setError(formError(reason));requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus())}
    finally{submitting.current=false;setPending(false)}
  }
  function fieldError(name:string){return error?.fieldErrors[name] && <p className="field-error" id={`${name}-error`}>{error.fieldErrors[name]}</p>}
  return <section className="profile-page"><div className="profile-heading"><div className="profile-avatar" aria-label="Profil baş harfleri">{(firstName[0]??'?')+(lastName[0]??'')}</div>
    <div><span className="eyebrow">SENİ TANIYALIM</span><h1>{initial.completed?'Profilim':'Profilini tamamla.'}</h1><p>Okumak için profil gerekmez. Soru sormak ve deneyim paylaşmak için kendini tanıt.</p></div></div>
    <form className="auth-card profile-form" onSubmit={submit} ref={form} onChange={()=>setSaved(false)}>
      <fieldset disabled={pending}><legend>Temel bilgiler</legend><div className="form-columns">
        <div><label htmlFor="firstName">Ad</label><input id="firstName" autoComplete="given-name" required maxLength={80} value={firstName} onChange={e=>setFirst(e.target.value)} aria-invalid={!!error?.fieldErrors.firstName} aria-describedby={error?.fieldErrors.firstName?'firstName-error':undefined}/>{fieldError('firstName')}</div>
        <div><label htmlFor="lastName">Soyad</label><input id="lastName" autoComplete="family-name" required maxLength={80} value={lastName} onChange={e=>setLast(e.target.value)} aria-invalid={!!error?.fieldErrors.lastName} aria-describedby={error?.fieldErrors.lastName?'lastName-error':undefined}/>{fieldError('lastName')}</div>
      </div><label htmlFor="educationStatus">Eğitim durumu</label><select id="educationStatus" value={status} onChange={e=>{setStatus(e.target.value as EducationStatus);setYear('')}}>
        {Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
      </select>{fieldError('educationStatus')}
      {status!=='YKS_ADAYI' && <div className="form-columns">
        <RemotePicker label="Üniversite" endpoint="/api/universities" value={university} onChange={value=>{setUniversity(value);setDepartment(null)}}/>
        <RemotePicker key={university?.id??'none'} label="Bölüm" endpoint={`/api/universities/${university?.id}/departments`} education value={department} disabled={!university}
          onChange={setDepartment} error={error?.fieldErrors.universityDepartmentId}/>
      </div>}
      {initial.education && !initial.education.available && department?.id===initial.education.id && status!=='YKS_ADAYI' && <p className="field-help">Mevcut eğitim kaydın korunuyor; bu eşleşme artık yeni seçimlere açık değil.</p>}
      {status==='MEZUN' && <><label htmlFor="graduationYear">Mezuniyet yılı</label><input id="graduationYear" type="number" min={1900} max={new Date().getFullYear()} required value={year} onChange={e=>setYear(e.target.value)} aria-invalid={!!error?.fieldErrors.graduationYear} aria-describedby={error?.fieldErrors.graduationYear?'graduationYear-error':undefined}/>{fieldError('graduationYear')}</>}
      </fieldset>
      <fieldset disabled={pending}><legend>Biraz daha sen (isteğe bağlı)</legend>
        <label htmlFor="biography">Kısa biyografi</label><textarea id="biography" maxLength={1000} rows={4} value={biography} onChange={e=>setBiography(e.target.value)}/>{fieldError('biography')}
        <div className="form-columns"><div><label htmlFor="occupation">Meslek</label><input id="occupation" maxLength={120} value={occupation} onChange={e=>setOccupation(e.target.value)}/>{fieldError('occupation')}</div>
        <div><label htmlFor="company">Şirket</label><input id="company" maxLength={120} value={company} onChange={e=>setCompany(e.target.value)}/>{fieldError('company')}</div></div>
      </fieldset>
      <AuthFormError error={error}/>{error?.code==='STALE_VERSION' && <button type="button" onClick={reload}>Güncel profili yükle</button>}
      {saved && <p className="success-notice" role="status">Profilin kaydedildi.</p>}
      <button className="button" disabled={pending}>{pending?'Kaydediliyor…':'Profili kaydet'}</button><Link to="/account">Hesabıma dön</Link>
    </form></section>
}
