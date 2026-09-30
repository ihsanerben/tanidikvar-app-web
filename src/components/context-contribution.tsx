"use client";

import {useRouter} from "next/navigation";
import {useState,type FormEvent} from "react";
import {experienceTemplates} from "./experience-templates";
import {useContributionClose} from "./contribution-dialog";
import {Button} from "./ui";
import {apiRequest} from "@/lib/client-api";

export function ContextContribution({universityId,programId,kind="all",templateType,after}:{universityId:string;programId?:string;kind?:"all"|"metrics"|"experiences";templateType?:string;after?:()=>void}) {
  const router=useRouter();
  const close=useContributionClose();
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(path:string,method:string,payload:object,success:string){if(busy)return false;setBusy(true);setMessage("");try{await apiRequest(path,{method,body:JSON.stringify(payload)});setMessage(success);router.refresh();after?.();return true;}catch(reason){setMessage(reason instanceof Error?reason.message:"Katkı kaydedilemedi.");return false;}finally{setBusy(false);}}

  function metric(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);void submit("/context-metrics","PUT",{universityId,programId:programId??null,metricKey:data.get("metricKey"),value:Number(data.get("value"))},"Ölçüm kaydedildi.");}
  function experience(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=event.currentTarget,data=new FormData(form);void submit("/experiences","POST",{universityId,programId:programId??null,templateType:data.get("templateType"),title:experienceTemplates.find(([key])=>key===data.get("templateType"))?.[1],body:data.get("body"),sentiment:"NEUTRAL"},"Deneyimin yayınlandı.").then(saved=>{if(saved){form.reset();close?.();}});}
  function career(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);void submit("/career-outcomes","PUT",{universityId,programId,sector:data.get("sector"),firstRole:data.get("firstRole"),companyType:data.get("companyType"),graduateStudy:data.get("graduateStudy")==="on",jobSearchMonths:Number(data.get("jobSearchMonths"))},"Kariyer yolculuğun anonim istatistiğe eklendi.");}
  return <div className="contribution-grid contribution-editor">
    {kind!=="experiences"&&<form className="stack-form" onSubmit={metric}><h3>Gerçek hayat ölçümü ekle</h3><label>Ölçüm<select name="metricKey"><option value="WEEKLY_STUDY_HOURS">Haftalık çalışma saati</option><option value="ATTENDANCE_LEVEL">Devam zorunluluğu (%)</option><option value="PROJECT_INTENSITY">Proje yoğunluğu (%)</option><option value="EXAM_INTENSITY">Sınav yoğunluğu (%)</option><option value="ENGLISH_PERCENT">İngilizce kullanım oranı</option><option value="GROUP_WORK_PERCENT">Grup çalışması oranı</option><option value="CAMPUS_HOURS">Kampüste geçirilen saat</option><option value="MONTHLY_HOUSING_COST">Aylık barınma maliyeti</option><option value="MONTHLY_TRANSPORT_COST">Aylık ulaşım maliyeti</option><option value="MONTHLY_FOOD_COST">Aylık yemek maliyeti</option></select></label><label>Değer<input name="value" type="number" min="0" max="1000000" step="0.01" required/></label><button className="button">Kaydet</button></form>}
    {kind!=="metrics"&&<form className="stack-form experience-editor" onSubmit={experience}>{templateType?<input type="hidden" name="templateType" value={templateType}/>:<><label>Hangi soruyu yanıtlamak istersin?<select name="templateType"><option value="WHY_I_CHOSE">Ben neden burayı seçtim?</option><option value="WISH_I_KNEW">Keşke tercih etmeden önce bilseydim</option><option value="EXPECTATION_REALITY">Beklediğim / gerçekte olan</option><option value="CHOOSE_AGAIN">Tekrar tercih eder miydim?</option></select></label></>}<label>Yorumun<textarea placeholder="Deneyimini paylaş" name="body" minLength={20} maxLength={5000} rows={5} required/></label><p className="form-hint">Yorumun en az 20 karakter olmalı.</p><Button disabled={busy}>{busy?"Yayınlanıyor…":"Yorumu paylaş"}</Button></form>}
    {kind==="all"&&programId&&<form className="stack-form" onSubmit={career}><h3>Mezun kariyer yolculuğu</h3><label>Sektör<input name="sector" minLength={2} maxLength={120} required/></label><label>İlk rol<input name="firstRole" minLength={2} maxLength={120} required/></label><label>Şirket türü<input name="companyType" minLength={2} maxLength={80} placeholder="Startup, kamu, kurumsal…" required/></label><label>İş bulma süresi (ay)<input name="jobSearchMonths" type="number" min="0" max="120" required/></label><label className="checkbox-row"><input name="graduateStudy" type="checkbox"/> Yüksek lisans yaptım/yapıyorum</label><button className="button">Anonim katkı yap</button></form>}
    {message&&<p role="status" className="muted">{message}</p>}
  </div>;
}
