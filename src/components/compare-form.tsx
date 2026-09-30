"use client";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {apiRequestAllPages} from "@/lib/client-api";
import {Button} from "./ui";

type Item={id:string;name:string};
type Program=Item&{faculties:string[];scoreTypes:string[]};
type Selection={universityId:string;programId:string};
const turkish=new Intl.Collator("tr",{sensitivity:"base"});
export function CompareForm({initialMode="UNIVERSITY",initialYear=2026,initialSelections=[{universityId:"",programId:""},{universityId:"",programId:""},{universityId:"",programId:""}]}:{initialMode?:string;initialYear?:number;initialSelections?:Selection[]}){
 const router=useRouter();
 const [items,setItems]=useState<Item[]>([]),[mode,setMode]=useState(initialMode),[year,setYear]=useState(initialYear),[selected,setSelected]=useState(initialSelections),[programs,setPrograms]=useState<Program[][]>([[],[],[]]),[error,setError]=useState("");
 useEffect(()=>{let active=true;apiRequestAllPages<Item>("/universities").then(data=>{if(active)setItems(data.toSorted((a,b)=>turkish.compare(a.name,b.name)));}).catch(()=>{if(active)setError("Üniversiteler yüklenemedi. Sayfayı yenileyerek tekrar deneyebilirsin.");});return()=>{active=false;};},[]);
 const universityKey=selected.map(item=>item.universityId).join(",");
 useEffect(()=>{let active=true;setPrograms([[],[],[]]);if(mode!=="PROGRAM")return;Promise.all(universityKey.split(",").map(id=>id?apiRequestAllPages<Program>(`/catalog-programs?universityId=${id}`):Promise.resolve([]))).then(data=>{if(active)setPrograms(data.map(items=>items.toSorted((a,b)=>turkish.compare(a.name,b.name))));}).catch(()=>{if(active)setError("Programlar yüklenemedi. Üniversiteyi yeniden seçerek tekrar deneyebilirsin.");});return()=>{active=false;};},[universityKey,mode]);
 function choose(index:number,universityId:string){setSelected(old=>old.map((item,i)=>i===index?{universityId,programId:""}:item));setError("");}
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const choices=selected.filter(item=>item.universityId),ids=choices.map(item=>mode==="PROGRAM"?item.programId:item.universityId);if(new Set(ids).size!==ids.length){setError("Aynı seçeneği birden fazla kez seçme.");return;}const params=new URLSearchParams({mode,year:String(year)});selected.forEach((item,index)=>{if(item.universityId){params.set(`u${index+1}`,item.universityId);if(mode==="PROGRAM")params.set(`p${index+1}`,item.programId);}});router.push(`/karsilastir?${params}`);}
 return <form className="compare-form" onSubmit={submit}>
  <div className="comparison-controls"><label>Karşılaştırma türü<select value={mode} onChange={event=>{setMode(event.target.value);setError("");}}><option value="UNIVERSITY">Üniversite</option><option value="PROGRAM">Üniversite + Program</option></select></label><label>Karşılaştırma yılı<select value={year} onChange={event=>setYear(Number(event.target.value))}>{Array.from({length:12},(_,i)=>2026-i).map(year=><option key={year}>{year}</option>)}</select></label></div>
  <div className="comparison-options">{selected.map((item,index)=><fieldset key={index}><legend>{index+1}. seçenek</legend><label>Üniversite<select required={index<2} value={item.universityId} onChange={event=>choose(index,event.target.value)}><option value="">Seç</option>{items.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{mode==="PROGRAM"&&<label>Program<select name={`p${index+1}`} disabled={!item.universityId} required={!!item.universityId} value={item.programId} onChange={event=>setSelected(old=>old.map((item,i)=>i===index?{...item,programId:event.target.value}:item))}><option value="">Seç</option>{programs[index].map(item=><option key={item.id} value={item.id}>{item.name} · {item.faculties.join(", ")||"Birim yok"} · {item.scoreTypes.join("/")}</option>)}</select></label>}{index===2&&<small className="comparison-optional">İsteğe bağlı</small>}</fieldset>)}</div>
  {error&&<p className="form-error" role="alert">{error}</p>}<Button type="submit">Karşılaştır</Button>
 </form>;
}
