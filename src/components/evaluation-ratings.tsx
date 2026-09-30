"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {apiRequest} from "@/lib/client-api";
import type {EvaluationCriterion, EvaluationRating} from "@/lib/api/decisions";

export function EvaluationRatings({universityId,programId,criteria,ratings,canContribute}:{universityId:string;programId?:string;criteria:EvaluationCriterion[];ratings:EvaluationRating[]|null;canContribute:boolean}) {
  const router=useRouter();
  return <div className="criteria-grid">{criteria.map(item=><CriterionRating key={item.criterionKey} item={item} universityId={universityId} programId={programId} initialRating={ratings?.find(rating=>rating.criterionKey===item.criterionKey)?.rating} canContribute={canContribute&&ratings!==null}/>)}{canContribute&&ratings===null&&<p role="alert">Önceki oyların yüklenemedi. <button className="button secondary" onClick={()=>router.refresh()}>Tekrar dene</button></p>}</div>;
}
function CriterionRating({item,universityId,programId,initialRating,canContribute}:{item:EvaluationCriterion;universityId:string;programId?:string;initialRating?:number;canContribute:boolean}) {
  const router=useRouter();
  const [saved,setSaved]=useState(initialRating);
  const [selected,setSelected]=useState(initialRating);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [failed,setFailed]=useState(false);
  async function submit(rating:number){if(busy||rating===saved)return;setSelected(rating);setBusy(true);setMessage("");setFailed(false);try{await apiRequest("/evaluations",{method:"PUT",body:JSON.stringify({universityId,programId:programId??null,criterionKey:item.criterionKey,rating})});setSaved(rating);setMessage("Oyun kaydedildi.");router.refresh();}catch(error){setSelected(saved);setFailed(true);setMessage(error instanceof Error?error.message:"Oy kaydedilemedi.");}finally{setBusy(false);}}
  return <article className="criterion-card"><header><h3>{item.label}</h3><div className="criterion-score"><strong>{item.voteCount?item.averageRating.toLocaleString("tr-TR",{maximumFractionDigits:1}):"—"} / 5</strong><span>{item.voteCount.toLocaleString("tr-TR")} oy</span></div></header><ol className="rating-distribution" aria-label={`${item.label} oy dağılımı ve puan seçimi`}>{[5,4,3,2,1].map(rating=><li key={rating} data-selected={canContribute&&selected===rating}>{canContribute?<label className="distribution-vote" title={`${rating} yıldız ver`}><input type="radio" name={`rating-${item.criterionKey}`} value={rating} checked={selected===rating} disabled={busy} onChange={()=>void submit(rating)}/><span>{rating} ★</span></label>:<span>{rating} ★</span>}<meter min={0} max={Math.max(item.voteCount,1)} value={item.distribution[rating-1]??0} aria-label={`${rating} yıldız`}/><span>{item.distribution[rating-1]??0}</span></li>)}</ol>{busy&&<p role="status">Kaydediliyor…</p>}{message&&<p className={failed?"form-error":"vote-confirmation"} role={failed?"alert":"status"}>{message}</p>}</article>;
}
