"use client";
import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";

type Profile={firstName:string;lastName:string;educationStatus:"YKS_ADAYI"|"UNIVERSITE_OGRENCISI"|"MEZUN";education:{universityId:string;departmentId:string}|null;classYear:number|null;graduationYear:number|null;biography:string|null;occupation:string|null;company:string|null;linkedinUrl:string|null;portfolioUrl:string|null;version:number};
type Item={id:string;name:string}; type Education={id:string;departmentId:string;departmentName:string}; type Page<T>={items:T[]};

export function ProfileForm(){
 const [profile,setProfile]=useState<Profile|null>(null),[universities,setUniversities]=useState<Item[]>([]),[educations,setEducations]=useState<Education[]>([]),[universityId,setUniversityId]=useState(""),[educationStatus,setEducationStatus]=useState<Profile["educationStatus"]>("YKS_ADAYI"),[message,setMessage]=useState("");
 useEffect(()=>{void Promise.all([apiRequest<Profile>("/me/profile"),apiRequest<Page<Item>>("/universities?size=100")]).then(([p,u])=>{setProfile(p);setUniversities(u.items);setUniversityId(p.education?.universityId??"");setEducationStatus(p.educationStatus);}).catch(()=>setMessage("Profil yüklenemedi."));},[]);
 useEffect(()=>{if(!universityId){setEducations([]);return;}apiRequest<Page<Education>>(`/universities/${universityId}/departments?size=100`).then(value=>setEducations(value.items)).catch(()=>setMessage("Programlar yüklenemedi."));},[universityId]);
 if(!profile)return <p className="muted">{message||"Profil yükleniyor…"}</p>;
 const current=profile;
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setMessage("");const data=new FormData(event.currentTarget);try{const status=data.get("educationStatus");const updated=await apiRequest<Profile>("/me/profile",{method:"PUT",body:JSON.stringify({firstName:data.get("firstName"),lastName:data.get("lastName"),educationStatus:status,universityId:status==="YKS_ADAYI"?null:universityId,departmentId:status==="YKS_ADAYI"?null:data.get("departmentId"),classYear:status==="UNIVERSITE_OGRENCISI"?Number(data.get("classYear")):null,graduationYear:status==="MEZUN"?Number(data.get("graduationYear")):null,biography:data.get("biography")||null,occupation:data.get("occupation")||null,company:data.get("company")||null,linkedinUrl:data.get("linkedinUrl")||null,portfolioUrl:data.get("portfolioUrl")||null,version:current.version})});setProfile(updated);setMessage("Profil güncellendi.");}catch(reason){setMessage(reason instanceof Error?reason.message:"Profil güncellenemedi.");}}
 return <form className="profile-edit-form" onSubmit={submit}>
  <fieldset className="profile-edit-section"><legend>Temel bilgiler</legend><div className="profile-edit-grid">
   <label>Ad<input name="firstName" defaultValue={current.firstName} required maxLength={80} placeholder=" "/></label>
   <label>Soyad<input name="lastName" defaultValue={current.lastName} required maxLength={80} placeholder=" "/></label>
   <label className="profile-edit-full">Eğitim durumu<select name="educationStatus" value={educationStatus} onChange={event=>setEducationStatus(event.target.value as Profile["educationStatus"])}><option value="YKS_ADAYI">YKS adayı</option><option value="UNIVERSITE_OGRENCISI">Üniversite öğrencisi</option><option value="MEZUN">Mezun</option></select></label>
   {educationStatus!=="YKS_ADAYI"&&<><label>Üniversite<select value={universityId} onChange={event=>setUniversityId(event.target.value)}><option value="">Seç</option>{universities.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Bölüm<select name="departmentId" defaultValue={current.education?.departmentId??""}><option value="">Seç</option>{educations.map(item=><option key={item.id} value={item.departmentId}>{item.departmentName}</option>)}</select></label></>}
   {educationStatus==="UNIVERSITE_OGRENCISI"&&<label className="profile-edit-full">Sınıf<input name="classYear" type="number" min="1" max="8" defaultValue={current.classYear??""} placeholder=" "/></label>}
   {educationStatus==="MEZUN"&&<label className="profile-edit-full">Mezuniyet yılı<input name="graduationYear" type="number" min="1900" max="9999" defaultValue={current.graduationYear??""} placeholder=" "/></label>}
  </div></fieldset>
  <fieldset className="profile-edit-section"><legend>İsteğe bağlı bilgiler</legend><div className="profile-edit-grid">
   <label className="profile-edit-full">Kısa biyografi<textarea name="biography" rows={5} maxLength={1000} defaultValue={current.biography??""} placeholder=" "/></label>
   <label>Meslek<input name="occupation" maxLength={120} defaultValue={current.occupation??""} placeholder=" "/></label><label>Şirket<input name="company" maxLength={120} defaultValue={current.company??""} placeholder=" "/></label>
   <label className="profile-edit-full">LinkedIn bağlantısı<input name="linkedinUrl" type="url" defaultValue={current.linkedinUrl??""} placeholder="https://www.linkedin.com/in/..."/></label><label className="profile-edit-full">Portfolyo sitesi<input name="portfolioUrl" type="url" defaultValue={current.portfolioUrl??""} placeholder="https://..."/></label>
   <p className="profile-edit-help">Bu bağlantılar profilinde herkese açık görünür.</p>
  </div></fieldset>
  {message&&<p className="muted" role="status">{message}</p>}<div className="profile-edit-actions"><button className="button">Profili kaydet</button><a className="button secondary" href="/hesabim">Hesabıma dön</a></div>
 </form>;
}
