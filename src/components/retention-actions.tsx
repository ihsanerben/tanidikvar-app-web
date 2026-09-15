"use client";
import { useState } from "react"; import { useRouter } from "next/navigation"; import { apiRequest } from "@/lib/client-api";
export function RetentionActions({ targetType, targetId, canSave = true }: { targetType: "UNIVERSITY"|"PROGRAM"|"QUESTION"|"TANIDIK"; targetId: string; canSave?: boolean }) {
  const router=useRouter();const [followed,setFollowed]=useState(false);const [saved,setSaved]=useState(false);const [message,setMessage]=useState("");
  async function change(kind:"follows"|"saved",active:boolean){setMessage("");try{await apiRequest(`/me/${kind}`,{method:"PUT",body:JSON.stringify({targetType,targetId,active})});if(kind==="follows")setFollowed(active);else setSaved(active);}catch(error){const text=error instanceof Error?error.message:"İşlem tamamlanamadı.";setMessage(text);if(text.includes("Oturum"))router.push("/giris");}}
  return <div><div className="inline-actions"><button className="button secondary" onClick={()=>change("follows",!followed)}>{followed?"Takibi bırak":"Takip et"}</button>{canSave&&<button className="button secondary" onClick={()=>change("saved",!saved)}>{saved?"Kayıttan çıkar":"Kaydet"}</button>}</div>{message&&<p className="form-error" role="alert">{message}</p>}</div>;
}
