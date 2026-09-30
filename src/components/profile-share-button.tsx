"use client";

import {useState} from "react";

export function ProfileShareButton({name,path}:{name:string;path:string}){
 const [message,setMessage]=useState("");
 async function share(){
  const url=new URL(path,window.location.origin).toString();
  try{
   if(navigator.share)await navigator.share({title:`${name} · TanıdıkVar`,url});
   else{await navigator.clipboard.writeText(url);setMessage("Profil bağlantısı kopyalandı.");}
  }catch(error){if(!(error instanceof DOMException&&error.name==="AbortError"))setMessage("Profil paylaşılamadı.");}
 }
 return <div className="profile-share-action"><button type="button" aria-label="Profili paylaş" title="Profili paylaş" onClick={()=>void share()}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M5 12v8h14v-8"/></svg></button>{message&&<span role="status" className="profile-share-status">{message}</span>}</div>;
}
