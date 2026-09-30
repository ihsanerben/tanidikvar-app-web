"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {apiRequest} from "@/lib/client-api";
import type {Metric} from "@/lib/api/decisions";
const definitions=[
 {key:"WEEKLY_STUDY_HOURS",label:"Haftalık çalışma",unit:"saat"},
 {key:"ATTENDANCE_LEVEL",label:"Devam zorunluluğu",unit:"%"},
 {key:"PROJECT_INTENSITY",label:"Proje yoğunluğu",unit:"%"},
 {key:"EXAM_INTENSITY",label:"Sınav yoğunluğu",unit:"%"},
 {key:"ENGLISH_PERCENT",label:"İngilizce kullanımı",unit:"%"},
 {key:"GROUP_WORK_PERCENT",label:"Grup çalışması",unit:"%"},
 {key:"CAMPUS_HOURS",label:"Kampüste geçirilen süre",unit:"saat"},
 {key:"MONTHLY_HOUSING_COST",label:"Aylık barınma",unit:"₺"},
 {key:"MONTHLY_TRANSPORT_COST",label:"Aylık ulaşım",unit:"₺"},
 {key:"MONTHLY_FOOD_COST",label:"Aylık yemek",unit:"₺"},
];
export function MetricParticipation({universityId,programId,metrics,canContribute,targetKey}:{universityId:string;programId?:string;metrics:Metric[];canContribute:boolean;targetKey?:string}) {
 return <div className="measurement-sections">{[false,true].map(cost=><section key={String(cost)}><h3>{cost?"Güncel öğrenci maliyeti":"Öğrencilik ve kampüs yaşamı"}</h3>{cost&&<p className="muted">Aylık giderler Türk lirası cinsindedir. Sonuçlar en az 5 katkıyla görünür.</p>}<div className="measurement-grid">{definitions.filter(item=>(item.unit==="₺")===cost).map(item=><Measurement key={item.key} definition={item} metric={metrics.find(metric=>metric.metricKey===item.key)} universityId={universityId} programId={programId} canContribute={canContribute} targeted={targetKey===item.key}/>)}</div></section>)}</div>;
}
function Measurement({definition,metric,universityId,programId,canContribute,targeted}:{definition:typeof definitions[number];metric?:Metric;universityId:string;programId?:string;canContribute:boolean;targeted:boolean}) {
 const router=useRouter(),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[failed,setFailed]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);setBusy(true);setMessage("");setFailed(false);try{await apiRequest("/context-metrics",{method:"PUT",body:JSON.stringify({universityId,programId:programId??null,metricKey:definition.key,value:Number(data.get("value"))})});setMessage("Katkın kaydedildi. Yeni değer göndererek güncelleyebilirsin.");router.refresh();}catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"Katkı kaydedilemedi.");}finally{setBusy(false);}}
 return <article id={`metric-${definition.key}`} className={`measurement-card${targeted?" notification-target":""}`}><h4>{definition.label}</h4><div className="measurement-value"><strong>{metric?.privacyThresholdMet&&metric.average!=null?metric.average.toLocaleString("tr-TR",{maximumFractionDigits:2}):"—"}</strong><span>{definition.unit}</span></div><p className="muted">{metric?.sampleSize??0} katkı{metric?.sampleSize&&!metric.privacyThresholdMet?" · Sonuç için en az 5 katkı gerekli":""}</p>{metric?.updatedAt&&<time dateTime={metric.updatedAt}>{new Date(metric.updatedAt).toLocaleDateString("tr-TR",{month:"long",year:"numeric"})}</time>}{canContribute&&<form onSubmit={submit}><label htmlFor={`value-${definition.key}`}>Senin değerin ({definition.unit})</label><div className="measurement-input"><input id={`value-${definition.key}`} name="value" type="number" inputMode="decimal" min="0" max="1000000" step="0.01" required disabled={busy}/><button className="button secondary" disabled={busy}>{busy?"Kaydediliyor…":"Katıl"}</button></div>{message&&<p className={failed?"form-error":"vote-confirmation"} role={failed?"alert":"status"}>{message}</p>}</form>}</article>;
}
