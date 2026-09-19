"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import { plainProgramName } from "@/lib/program-label";

type Application={id:string;firstName:string;lastName:string;educationStatus:string;universityName:string|null;departmentName:string|null;graduationYear:number|null;occupation:string|null;company:string|null;coverLetter:string;status:"PENDING"|"APPROVED"|"REJECTED";submittedAt:string;reviewedAt:string|null;rejectionReason:string|null;activeVerification:boolean;version:number};
type Page<T>={items:T[];page:number;size:number;totalElements:number};
type Profile={version:number;completed:boolean;firstName:string;lastName:string;educationStatus:string;education:{universityName:string;departmentName:string}|null;graduationYear:number|null};
const statusLabel={PENDING:"İnceleme bekliyor",APPROVED:"Onaylandı",REJECTED:"Reddedildi"};
const educationLabel=(status:string,year:number|null)=>status==="YKS_ADAYI"?"YKS Adayı":status==="MEZUN"?`${year??"—"} Mezunu`:"Üniversite Öğrencisi";
const date=(value:string)=>new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Istanbul"}).format(new Date(value));

export function TanidikApplications(){
  const[items,setItems]=useState<Application[]|null>(null),[profile,setProfile]=useState<Profile|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const requestId=useRef(crypto.randomUUID());
  const load=()=>Promise.all([apiRequest<Page<Application>>("/me/tanidik-applications?size=100"),apiRequest<Profile>("/me/profile")]).then(([applications,current])=>{setItems(applications.items.map(item=>({...item,departmentName:plainProgramName(item.departmentName)||null})));setProfile({...current,education:current.education?{...current.education,departmentName:plainProgramName(current.education.departmentName)}:null});}).catch(()=>setMessage("Başvurular yüklenemedi."));
  useEffect(()=>{void load();},[]);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!profile||busy)return;setBusy(true);setMessage("");const form=new FormData(event.currentTarget);try{await apiRequest("/me/tanidik-applications",{method:"POST",body:JSON.stringify({requestId:requestId.current,profileVersion:profile.version,coverLetter:form.get("coverLetter")})});requestId.current=crypto.randomUUID();setMessage("Tanıdık başvurun alındı.");await load();}catch(reason){setMessage(reason instanceof Error?reason.message:"Başvuru gönderilemedi.");}finally{setBusy(false);}}
  const pending=items?.some(item=>item.status==="PENDING"),approved=items?.some(item=>item.activeVerification),canApply=profile?.completed&&!pending&&!approved;
  return <section className="profile-page tanidik-applications-page">
    <div className="profile-heading"><div><h1>Başvurularım</h1></div></div>
    {items===null&&!message?<p role="status">Başvurular yükleniyor…</p>:items?.length?<div className="application-list">{items.map(item=><article className="auth-card application-card" key={`${item.id}-${item.version}-${item.activeVerification}`}><div><span className={`application-status status-${item.status.toLowerCase()}`}>{statusLabel[item.status]}</span><h2>{item.firstName} {item.lastName}</h2>{item.universityName&&item.departmentName&&<p>{item.universityName} · {item.departmentName}</p>}<p>{educationLabel(item.educationStatus,item.graduationYear)}</p>{(item.occupation||item.company)&&<p>{item.occupation}{item.company&&` · ${item.company}`} <small>(kişisel beyan)</small></p>}<div className="application-note application-cover-letter"><strong>Ön yazı:</strong><p>{item.coverLetter||"Eski başvuruda ön yazı bulunmuyor."}</p></div><p>Başvuru tarihi: <time dateTime={item.submittedAt}>{date(item.submittedAt)}</time></p>{item.reviewedAt&&<p>{item.status==="APPROVED"?"Onay tarihi":"Karar tarihi"}: <time dateTime={item.reviewedAt}>{date(item.reviewedAt)}</time></p>}{item.status==="APPROVED"&&!item.activeVerification&&<p className="application-note application-suspended">Tanıdık statün şu anda aktif değil.</p>}{item.rejectionReason&&<div className="application-note application-reason"><strong>Ret gerekçesi:</strong><p>{item.rejectionReason}</p></div>}</div></article>)}</div>:<p className="muted">Henüz başvurun yok.</p>}
    {canApply&&profile&&<form className="auth-card tanidik-application-form" onSubmit={submit}><h2>Tanıdık başvurusu</h2><p>{profile.firstName} {profile.lastName}{profile.education&&` · ${profile.education.universityName} · ${profile.education.departmentName}`}</p><p>{educationLabel(profile.educationStatus,profile.graduationYear)}</p><p className="field-help">Başvurun eğitim ve profil bilgilerine göre incelenir. Gönderilen bilgiler sonradan değiştirilemez.</p><label htmlFor="tanidik-cover-letter">Kısa ön yazı</label><textarea id="tanidik-cover-letter" name="coverLetter" required minLength={20} maxLength={1000} rows={5} placeholder="Kendini ve neden Tanıdık olmak istediğini kısaca anlat."/><p className="field-help">20–1000 karakter</p><button className="button" disabled={busy}>{busy?"Gönderiliyor…":"Başvuruyu gönder"}</button></form>}
    {!profile?.completed&&profile&&<div className="auth-card"><p>Tanıdık başvurusu için eğitim bilgilerini tamamla.</p><Link href="/hesabim/profil">Profilime git</Link></div>}
    {message&&<p role="status" className="form-message">{message}</p>}
  </section>;
}
