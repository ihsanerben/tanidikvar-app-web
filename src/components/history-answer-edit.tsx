"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {apiRequest} from "@/lib/client-api";
import {ModalShell} from "@/components/modal-shell";
import {Button} from "@/components/ui";

export function HistoryAnswerEdit({id,body,version,type}:{id:string;body:string;version:number;type:"COMMUNITY"|"TANIDIK"}){
 const router=useRouter(),[open,setOpen]=useState(false),[value,setValue]=useState(body),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function save(event:FormEvent){event.preventDefault();setBusy(true);setError("");try{await apiRequest(`/${type==="TANIDIK"?"admin-answers":"answers"}/${id}`,{method:"PUT",body:JSON.stringify({body:value.trim(),version})});setOpen(false);router.refresh();}catch(reason){setError(reason instanceof Error?reason.message:"Yorum güncellenemedi.");}finally{setBusy(false)}}
 return <><Button tone="secondary" type="button" onClick={()=>setOpen(true)}>Düzenle</Button><ModalShell open={open} onClose={()=>setOpen(false)} title="Yorumu düzenle"><form className="stack-form" onSubmit={save}><label>Yorum<textarea required minLength={10} maxLength={5000} value={value} onChange={event=>setValue(event.target.value)}/></label>{error&&<p className="form-error" role="alert">{error}</p>}<div className="answer-form-actions"><Button disabled={busy||value.trim().length<10}>{busy?"Kaydediliyor…":"Kaydet"}</Button><Button tone="secondary" type="button" onClick={()=>setOpen(false)}>Vazgeç</Button></div></form></ModalShell></>;
}
