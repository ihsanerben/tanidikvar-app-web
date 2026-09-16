"use client";
import {useEffect,useState} from "react";
import {apiRequest,apiRequestAllPages} from "@/lib/client-api";

type Run={id:string;operation:string;status:string;universitiesSeen:number;programsSeen:number;optionsSeen:number;startedAt:string;failureReason:string|null;qualityReport:Record<string,number>|null};
type University={id:string;name:string};
type Program={id:string;name:string;faculties:string[];scoreTypes:string[];degreeLevel:string;optionCount:number};
const turkish=new Intl.Collator("tr",{sensitivity:"base"});

export function CatalogSyncManager(){
 const[run,setRun]=useState<Run|null>(null),[history,setHistory]=useState<Run[]>([]),[busy,setBusy]=useState(false),[universities,setUniversities]=useState<University[]>([]),[selected,setSelected]=useState(""),[programs,setPrograms]=useState<Program[]>([]),[message,setMessage]=useState("");
 const loadHistory=()=>apiRequest<Run[]>("/manager/catalog/dataset-sync").then(setHistory).catch(()=>setMessage("Senkronizasyon geçmişi yüklenemedi."));
 useEffect(()=>{void loadHistory();apiRequestAllPages<University>("/universities").then(data=>setUniversities(data.toSorted((a,b)=>turkish.compare(a.name,b.name)))).catch(()=>setMessage("Üniversiteler yüklenemedi."));},[]);
 useEffect(()=>{if(!selected){setPrograms([]);return;}apiRequestAllPages<Program>(`/catalog-programs?universityId=${selected}`).then(data=>setPrograms(data.toSorted((a,b)=>turkish.compare(a.name,b.name)))).catch(()=>setMessage("Program hiyerarşisi yüklenemedi."));},[selected]);
 async function start(preview:boolean){setBusy(true);setMessage("");try{let value=await apiRequest<Run>(`/manager/catalog/dataset-sync${preview?"/preview":""}`,{method:"POST"});setRun(value);while(["STARTED","PENDING","RUNNING"].includes(value.status)){await new Promise(resolve=>setTimeout(resolve,2000));value=await apiRequest<Run>(`/manager/catalog/dataset-sync/${value.id}`);setRun(value);}await loadHistory();setMessage(value.status==="SUCCEEDED"?`${preview?"Önizleme":"Aktarım"} tamamlandı.`:value.failureReason??"Aktarım tamamlanamadı.");}catch(error){setMessage(error instanceof Error?error.message:"İşlem başlatılamadı.");}finally{setBusy(false);}}
 return <section className="manager-extension">
  <h2>Normalize katalog senkronizasyonu</h2><p>Önizleme veri yazmadan kalite raporu üretir. Uygula, kaynaktan kaldırılan dataset kayıtlarını pasife alır.</p>
  <div className="actions"><button className="button secondary" disabled={busy} onClick={()=>start(true)}>Kalite önizlemesi</button><button className="button" disabled={busy} onClick={()=>start(false)}>Aktarımı uygula</button></div>
  {run&&<RunCard run={run}/>} {message&&<p role="status">{message}</p>}
  <h2>Senkronizasyon geçmişi</h2>{history.length===0?<p>Henüz kayıt yok.</p>:<div className="catalog-table-wrap"><table className="catalog-table"><thead><tr><th>Başlangıç</th><th>İşlem</th><th>Durum</th><th>Üniversite</th><th>Program</th><th>Seçenek</th></tr></thead><tbody>{history.map(item=><tr key={item.id}><td>{new Date(item.startedAt).toLocaleString("tr-TR")}</td><td>{item.operation}</td><td>{item.status}</td><td>{item.universitiesSeen}</td><td>{item.programsSeen}</td><td>{item.optionsSeen}</td></tr>)}</tbody></table></div>}
  <h2>Üniversite → fakülte → program → istatistik</h2><label>Üniversite<select value={selected} onChange={event=>setSelected(event.target.value)}><option value="">Seç</option>{universities.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
  {programs.map(program=><details key={program.id}><summary>{program.name} · {program.degreeLevel}</summary><p>{program.faculties.join(" · ")||"Akademik birim belirtilmemiş"}</p><p>{program.scoreTypes.join("/")} · {program.optionCount} seçenek</p><a href={`/program/${program.id}`}>Yıllık istatistikleri aç</a></details>)}
 </section>;
}
function RunCard({run}:{run:Run}){return <article className="auth-card"><h3>{run.operation} · {run.status}</h3><p>{run.universitiesSeen} üniversite · {run.programsSeen} program · {run.optionsSeen} seçenek</p>{run.qualityReport&&<dl>{Object.entries(run.qualityReport).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value.toLocaleString("tr-TR")}</dd></div>)}</dl>}{run.failureReason&&<p className="form-error">{run.failureReason}</p>}</article>}
