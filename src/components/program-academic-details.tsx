"use client";

import {useMemo,useState} from "react";
import type {AdmissionOption,ProgramAcademicDetails} from "@/lib/api/catalog";

const number=(value:number|null,digits=0)=>value?.toLocaleString("tr-TR",{maximumFractionDigits:digits})??"Veri yok";
const optionRank=(option:AdmissionOption)=>option.statistics.find(stat=>stat.successRank!==null)?.successRank??Number.MAX_SAFE_INTEGER;

export function ProgramAcademicDetailsPanel({details,options,isPrivate}:{details:ProgramAcademicDetails[];options:AdmissionOption[];isPrivate:boolean}){
  const sorted=useMemo(()=>details.toSorted((a,b)=>{
    const rank=(detail:ProgramAcademicDetails)=>Math.min(...options.filter(option=>option.faculty===detail.faculty).map(optionRank),Number.MAX_SAFE_INTEGER);
    return rank(a)-rank(b)||(a.faculty??"").localeCompare(b.faculty??"","tr");
  }),[details,options]);
  const [selected,setSelected]=useState(sorted[0]?.academicUnitId??"0"),active=sorted.find((detail,index)=>(detail.academicUnitId??String(index))===selected)??sorted[0];
  if(!active&&!isPrivate)return null;
  const matchingOptions=active?options.filter(option=>option.faculty===active.faculty):options;
  const annualFees=matchingOptions.map(option=>option.annualFee).filter((fee):fee is number=>fee!==null),annualFee=annualFees.length?Math.max(...annualFees):null;
  const academicianTotal=active?[active.professorCount,active.associateProfessorCount,active.doctorFacultyMemberCount,active.researchAssistantCount].reduce<number>((sum,value)=>sum+(value??0),0):0;
  return <section className="shared-program-details"><h2>Programın ortak bilgileri</h2><p className="muted">Akademik bilgiler aynı yerleşkedeki burslu, indirimli ve ücretli kontenjan seçenekleri için ortaktır.</p>{sorted.length>1&&<div className="academic-detail-tabs" role="tablist" aria-label="Akademik birimler">{sorted.map((detail,index)=>{const id=detail.academicUnitId??String(index),isActive=id===(active?.academicUnitId??String(sorted.indexOf(active)));return <button key={id} type="button" role="tab" aria-selected={isActive} className={isActive?"active":undefined} onClick={()=>setSelected(id)}>{detail.faculty??"Akademik birim"}</button>})}</div>}{active&&<div className="academic-detail-group" role="tabpanel"><h3>{active.faculty??"Akademik birim"}</h3><div className="closing-summary">
    <div><span>Akademik kadro</span><strong>{academicianTotal||"Veri yok"}</strong><small>Toplam akademisyen</small></div>
    <div><span>Akreditasyon</span><strong>{active.accreditationCode??"Veri yok"}</strong><small>{active.accreditationDescription??"Resmî kayıtta açıklama yok"}</small></div>
  </div><dl className="program-facts">
    <div><dt>Profesör</dt><dd>{active.professorCount??"Veri yok"}</dd></div>
    <div><dt>Doçent</dt><dd>{active.associateProfessorCount??"Veri yok"}</dd></div>
    <div><dt>Dr. Öğr. Üyesi</dt><dd>{active.doctorFacultyMemberCount??"Veri yok"}</dd></div>
    <div><dt>Araştırma görevlisi</dt><dd>{active.researchAssistantCount??"Veri yok"}</dd></div>
  </dl></div>}{isPrivate&&<div className="academic-detail-group"><h3>Ücret bilgisi</h3><dl className="program-facts single-program-fee"><div><dt>Yıllık ücret</dt><dd>{annualFee?`${number(annualFee)} TL`:"Kaynakta belirtilmemiş"}</dd></div></dl></div>}</section>;
}
