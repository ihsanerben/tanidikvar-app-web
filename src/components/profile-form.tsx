"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiRequest, apiRequestAllPages } from "@/lib/client-api";
import {confirmDialog} from "@/lib/dialogs";
import {uniquePrograms} from "@/lib/program-label";

type Profile={firstName:string;lastName:string;educationStatus:"YKS_ADAYI"|"UNIVERSITE_OGRENCISI"|"MEZUN";programId:string|null;education:{universityId:string;departmentId:string;departmentName:string}|null;classYear:number|null;graduationYear:number|null;biography:string|null;occupation:string|null;company:string|null;linkedinUrl:string|null;portfolioUrl:string|null;version:number};
type Item={id:string;name:string}; type Education={id:string;name:string;faculties:string[];scoreTypes:string[];degreeLevel:string};
const turkish=new Intl.Collator("tr",{sensitivity:"base"});

export function ProfileForm(){
 const saving=useRef(false);
 const [busy,setBusy]=useState(false);
 const [profile,setProfile]=useState<Profile|null>(null),[universities,setUniversities]=useState<Item[]>([]),[educations,setEducations]=useState<(Education&{displayName:string})[]>([]),[universityId,setUniversityId]=useState(""),[programId,setProgramId]=useState(""),[educationStatus,setEducationStatus]=useState<Profile["educationStatus"]>("YKS_ADAYI"),[message,setMessage]=useState("");
 useEffect(()=>{void Promise.all([apiRequest<Profile>("/me/profile"),apiRequestAllPages<Item>("/universities")]).then(([p,u])=>{setProfile(p);setUniversities(u.toSorted((a,b)=>turkish.compare(a.name,b.name)));setUniversityId(p.education?.universityId??"");setProgramId(p.programId??"");setEducationStatus(p.educationStatus);}).catch(()=>setMessage("Profil yüklenemedi."));},[]);
 useEffect(()=>{if(!universityId){setEducations([]);return;}let active=true;setEducations([]);void apiRequestAllPages<Education>(`/catalog-programs?universityId=${universityId}`).then(items=>{if(active)setEducations(uniquePrograms(items));}).catch(()=>{if(active)setMessage("Programlar yüklenemedi.");});return()=>{active=false;};},[universityId]);
 if(!profile)return <p className="muted">{message||"Profil yükleniyor…"}</p>;
 const current=profile;
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(saving.current)return;saving.current=true;setBusy(true);setMessage("");const data=new FormData(event.currentTarget);try{const status=data.get("educationStatus");const nextUniversityId=status==="YKS_ADAYI"?null:universityId||null;
 if((current.education?.universityId??null)!==nextUniversityId){
  const user=await apiRequest<{role:string}>("/me");
  if(user.role==="TANIDIK"&&!await confirmDialog("Üniversite bilgin değişeceği için Tanıdık statün kaldırılacak. Yeniden doğrulama başvurun otomatik oluşturulacak; yönetici onayladığında statün geri verilecek. Bilgilerini kaydetmek istiyor musun?",{title:"Tanıdık statün etkilenecek",confirmLabel:"Değişikliği kaydet",cancelLabel:"Vazgeç",tone:"danger"}))return;
 }
 const unchangedLegacyDepartment=!programId&&current.programId===null&&current.education?.universityId===universityId;
 const updated=await apiRequest<Profile>("/me/profile",{method:"PUT",body:JSON.stringify({firstName:data.get("firstName"),lastName:data.get("lastName"),educationStatus:status,universityId:status==="YKS_ADAYI"?null:universityId,programId:status==="YKS_ADAYI"?null:programId||null,departmentId:status==="YKS_ADAYI"?null:unchangedLegacyDepartment?current.education?.departmentId:null,classYear:status==="UNIVERSITE_OGRENCISI"?Number(data.get("classYear")):null,graduationYear:status==="MEZUN"?Number(data.get("graduationYear")):null,biography:data.get("biography")||null,occupation:data.get("occupation")||null,company:data.get("company")||null,linkedinUrl:data.get("linkedinUrl")||null,portfolioUrl:data.get("portfolioUrl")||null,version:current.version})});setProfile(updated);window.location.replace("/hesabim");}catch(reason){setMessage(reason instanceof Error?reason.message:"Profil güncellenemedi.");}finally{saving.current=false;setBusy(false);}}
 return <form className="profile-edit-form" onSubmit={submit}>
  <fieldset disabled={busy} className="profile-edit-section"><legend>Temel bilgiler</legend><div className="profile-edit-grid">
   <label>Ad<input name="firstName" defaultValue={current.firstName} required maxLength={80} placeholder=" "/></label>
   <label>Soyad<input name="lastName" defaultValue={current.lastName} required maxLength={80} placeholder=" "/></label>
   <label className="profile-edit-full">Eğitim durumu<select name="educationStatus" value={educationStatus} onChange={event=>setEducationStatus(event.target.value as Profile["educationStatus"])}><option value="YKS_ADAYI">YKS adayı</option><option value="UNIVERSITE_OGRENCISI">Üniversite öğrencisi</option><option value="MEZUN">Mezun</option></select></label>
   {educationStatus!=="YKS_ADAYI"&&<><label>Üniversite<select value={universityId} onChange={event=>{if(event.target.value!==universityId){setUniversityId(event.target.value);setProgramId("");}}}><option value="">Seç</option>{universities.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Bölüm<select name="programId" value={programId} onChange={event=>setProgramId(event.target.value)}><option value="">{!programId&&current.programId===null&&current.education?.universityId===universityId?current.education.departmentName:"Seç"}</option>{programId&&!educations.some(item=>item.id===programId)&&<option value={programId}>{current.education?.departmentName??"Kayıtlı bölüm"}</option>}{educations.map(item=><option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label></>}
   {educationStatus==="UNIVERSITE_OGRENCISI"&&<label className="profile-edit-full">Sınıf<input name="classYear" type="number" min="1" max="8" defaultValue={current.classYear??""} placeholder=" "/></label>}
   {educationStatus==="MEZUN"&&<label className="profile-edit-full">Mezuniyet yılı<input name="graduationYear" type="number" min="1900" max="9999" defaultValue={current.graduationYear??""} placeholder=" "/></label>}
  </div></fieldset>
  <fieldset disabled={busy} className="profile-edit-section"><legend>İsteğe bağlı bilgiler</legend><div className="profile-edit-grid">
   <label className="profile-edit-full">Kısa biyografi<textarea name="biography" rows={5} maxLength={1000} defaultValue={current.biography??""} placeholder=" "/></label>
   <label>Meslek<input name="occupation" maxLength={120} defaultValue={current.occupation??""} placeholder=" "/></label><label>Şirket<input name="company" maxLength={120} defaultValue={current.company??""} placeholder=" "/></label>
   <label className="profile-edit-full">LinkedIn bağlantısı<input name="linkedinUrl" type="url" defaultValue={current.linkedinUrl??""} placeholder="https://www.linkedin.com/in/..."/></label><label className="profile-edit-full">Portfolyo sitesi<input name="portfolioUrl" type="url" defaultValue={current.portfolioUrl??""} placeholder="https://..."/></label>
   <p className="profile-edit-help">Bu bağlantılar profilinde herkese açık görünür.</p>
  </div></fieldset>
  {message&&<p className="muted" role="status">{message}</p>}<div className="profile-edit-actions"><button className="button" disabled={busy}>{busy?"Kaydediliyor…":"Profili kaydet"}</button><a className="button secondary" href="/hesabim">Hesabıma dön</a></div>
 </form>;
}
