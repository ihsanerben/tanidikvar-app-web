"use client";

import {useMemo,useState} from "react";
import type {AdmissionOption,AdmissionStatistics} from "@/lib/api/catalog";

const number=(value:number|null,digits=0)=>value?.toLocaleString("tr-TR",{maximumFractionDigits:digits})??"Veri yok";
const netColumns:{key:keyof AdmissionStatistics;label:string}[]=[
  {key:"averageSecondaryScore",label:"Diploma notu"},
  {key:"tytTurkishNet",label:"TYT Türkçe"},{key:"tytSocialNet",label:"TYT Sosyal"},
  {key:"tytMathNet",label:"TYT Matematik"},{key:"tytScienceNet",label:"TYT Fen"},
  {key:"aytMathNet",label:"AYT Matematik"},{key:"aytPhysicsNet",label:"AYT Fizik"},
  {key:"aytChemistryNet",label:"AYT Kimya"},{key:"aytBiologyNet",label:"AYT Biyoloji"},
  {key:"aytLiteratureNet",label:"AYT Edebiyat"},{key:"aytHistory1Net",label:"AYT Tarih-1"},
  {key:"aytGeography1Net",label:"AYT Coğrafya-1"},{key:"aytHistory2Net",label:"AYT Tarih-2"},
  {key:"aytGeography2Net",label:"AYT Coğrafya-2"},{key:"aytPhilosophyNet",label:"AYT Felsefe"},
  {key:"aytReligionNet",label:"AYT Din"},{key:"foreignLanguageNet",label:"YDT"},
];

const closingStatistic=(option:AdmissionOption)=>option.statistics.find(stat=>stat.successRank!==null&&stat.minimumScore!==null)
  ??option.statistics.find(stat=>stat.successRank!==null)
  ??option.statistics.find(stat=>stat.minimumScore!==null);
const latestRank=(option:AdmissionOption)=>closingStatistic(option)?.successRank??Number.MAX_SAFE_INTEGER;
const optionLabel=(option:AdmissionOption)=>[option.faculty,option.language,option.scholarship,option.specialQuotaType].filter(Boolean).join(" · ")||option.programCode;

function NetTable({statistics}:{statistics:AdmissionStatistics[]}){
  const rows=statistics.filter(stat=>netColumns.some(column=>stat[column.key]!==null)).slice(0,3);
  const columns=netColumns.filter(column=>rows.some(stat=>stat[column.key]!==null));
  if(!rows.length)return null;
  return <div className="catalog-table-wrap"><table className="catalog-table"><caption>Programa son yerleşen öğrencinin diploma notu ve netleri</caption><thead><tr><th>Yıl</th>{columns.map(column=><th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map(stat=><tr key={stat.year}><th>{stat.year}</th>{columns.map(column=>{const value=stat[column.key] as number|null;return <td key={column.key}>{number(column.key==="averageSecondaryScore"&&value!==null?value/5:value,2)}</td>})}</tr>)}</tbody></table></div>;
}

function OptionDetails({option,name}:{option:AdmissionOption;name:string}){
  const latest=option.statistics[0],closing=closingStatistic(option);
  return <section className="admission-option">
    <h2>{[name,option.language,option.scholarship,option.specialQuotaType].filter(Boolean).join(" · ")}</h2>
    <p>{[option.faculty,option.programCode,option.scoreType,option.educationType,option.durationYears?`${option.durationYears} yıl`:null].filter(Boolean).join(" · ")}</p>
    <div className="closing-summary">
      <div><span>Kaçla kapattı? · {closing?.year??"Veri yok"}</span><strong>{number(closing?.successRank??null)} sıra</strong><small>{number(closing?.minimumScore??null,3)} taban puan</small></div>
      <div><span>Kontenjan / yerleşen</span><strong>{latest?.quota??"Veri yok"} / {latest?.placed??"Veri yok"}</strong><small>Son açıklanan yerleştirme</small></div>
    </div>
    <div className="catalog-table-wrap"><table className="catalog-table"><caption>Yıllara göre kontenjan, yerleşen, taban puan ve başarı sırası</caption><thead><tr><th>Yıl</th><th>Kontenjan</th><th>Yerleşen</th><th>Taban puan</th><th>Başarı sırası</th></tr></thead><tbody>{option.statistics.map(stat=><tr key={stat.year}><th>{stat.year}</th><td>{stat.quota??"Veri yok"}</td><td>{stat.placed??"Veri yok"}</td><td>{number(stat.minimumScore,3)}</td><td>{number(stat.successRank)}</td></tr>)}</tbody></table></div>
    <NetTable statistics={option.statistics}/>
  </section>;
}

export function ProgramOptions({options,name}:{options:AdmissionOption[];name:string}){
  const sorted=useMemo(()=>options.toSorted((a,b)=>latestRank(a)-latestRank(b)||optionLabel(a).localeCompare(optionLabel(b),"tr")),[options]);
  const [selected,setSelected]=useState(sorted[0]?.id??"");
  const active=sorted.find(option=>option.id===selected)??sorted[0];
  if(!active)return null;
  return <section className="program-options"><div className="program-option-tabs" role="tablist" aria-label="Program seçenekleri">{sorted.map(option=>{
    const rank=latestRank(option),isActive=option.id===active.id;
    return <button key={option.id} type="button" role="tab" aria-selected={isActive} className={isActive?"active":undefined} onClick={()=>setSelected(option.id)}><span>{optionLabel(option)}</span><small>{rank===Number.MAX_SAFE_INTEGER?"Başarı sırası yok":`${number(rank)} sıra`}</small></button>;
  })}</div><div role="tabpanel"><OptionDetails option={active} name={name}/></div></section>;
}
