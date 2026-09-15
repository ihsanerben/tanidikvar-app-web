"use client";
import {useEffect,useState,type FormEvent} from "react";
import {apiRequest,apiRequestAllPages} from "@/lib/client-api";

type University={id:string;name:string;city:string|null;institutionType:"DEVLET"|"VAKIF"|"BELIRTILMEMIS";description:string|null;websiteUrl:string|null;logoUrl:string|null;accentPrimary:string|null;accentSoft:string|null;accentForeground:string|null;version:number};
export function UniversityDetailsManager(){
  const[items,setItems]=useState<University[]>([]),[selected,setSelected]=useState(""),[message,setMessage]=useState("");
  useEffect(()=>{apiRequestAllPages<University>("/universities").then(items=>setItems(items.toSorted((a,b)=>a.name.localeCompare(b.name,"tr",{sensitivity:"base"}))));},[]);
  const current=items.find(item=>item.id===selected);
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!current)return;
    const data=new FormData(event.currentTarget);
    const payload=Object.fromEntries(["city","institutionType","description","websiteUrl","logoUrl","accentPrimary","accentSoft","accentForeground"].map(key=>[key,data.get(key)]));
    try{
      const updated=await apiRequest<University>(`/manager/universities/${current.id}/details`,{method:"PUT",body:JSON.stringify({...payload,version:current.version,reason:"Üniversite public bilgileri güncellendi."})});
      setItems(old=>old.map(item=>item.id===updated.id?updated:item));setMessage("Üniversite bilgileri güncellendi.");
    }catch(reason){setMessage(reason instanceof Error?reason.message:"Bilgiler kaydedilemedi.");}
  }
  return <section><h2>Üniversite sayfası ve tema</h2><label>Üniversite<select value={selected} onChange={event=>setSelected(event.target.value)}><option value="">Seç</option>{items.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label>{current&&<form className="stack-form" key={current.version} onSubmit={save}><label>Şehir<input name="city" defaultValue={current.city??""} maxLength={120}/></label><label>Kurum türü<select name="institutionType" defaultValue={current.institutionType}><option value="BELIRTILMEMIS">Belirtilmemiş</option><option value="DEVLET">Devlet</option><option value="VAKIF">Vakıf</option></select></label><label>Kısa tanıtım<textarea name="description" defaultValue={current.description??""} maxLength={2000}/></label><label>Resmî web sitesi<input name="websiteUrl" type="url" defaultValue={current.websiteUrl??""}/></label><label>Logo URL<input name="logoUrl" type="url" defaultValue={current.logoUrl??""}/></label><label>Ana accent<input name="accentPrimary" defaultValue={current.accentPrimary??""} placeholder="#5B5BD6" pattern="#[0-9A-Fa-f]{6}"/></label><label>Soft accent<input name="accentSoft" defaultValue={current.accentSoft??""} placeholder="#EEEEFF" pattern="#[0-9A-Fa-f]{6}"/></label><label>Accent üzeri yazı<input name="accentForeground" defaultValue={current.accentForeground??""} placeholder="#FFFFFF" pattern="#[0-9A-Fa-f]{6}"/></label><button className="button">Bilgileri kaydet</button></form>}{message&&<p role="status">{message}</p>}</section>;
}
