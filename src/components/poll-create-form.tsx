"use client";
import {useRouter} from "next/navigation";
import {useState,type FormEvent} from "react";
import {useContributionClose} from "./contribution-dialog";
import {Button} from "./ui";
import {apiRequest} from "@/lib/client-api";

export function PollCreateForm({universityId,programId}:{universityId:string;programId?:string}){
 const close=useContributionClose();
 const router=useRouter(),[message,setMessage]=useState(""),[options,setOptions]=useState(["",""]),[busy,setBusy]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setMessage("");const form=event.currentTarget,data=new FormData(form),values=options.map(value=>value.trim()).filter(Boolean);try{await apiRequest("/polls",{method:"POST",body:JSON.stringify({universityId,programId:programId??null,question:data.get("question"),options:values,verifiedOnly:false,closesAt:null})});form.reset();setOptions(["",""]);setMessage("Anket yayınlandı.");router.refresh();close?.();}catch(error){setMessage(error instanceof Error?error.message:"Anket yayınlanamadı.");}finally{setBusy(false);}}
 return <form className="stack-form decision-form poll-create-form" onSubmit={submit}><p className="muted">Topluluğa açık bir soru sor; en az iki farklı seçenek ekle.</p><label>Soru<input name="question" minLength={10} maxLength={300} required/></label><fieldset><legend>Seçenekler</legend>{options.map((value,index)=><div className="poll-option-row" key={index}><label><span>{index+1}. seçenek</span><input value={value} onChange={event=>setOptions(current=>current.map((item,itemIndex)=>itemIndex===index?event.target.value:item))} maxLength={120} required={index<2}/></label>{options.length>2&&<button type="button" aria-label={`${index+1}. seçeneği kaldır`} onClick={()=>setOptions(current=>current.filter((_,itemIndex)=>itemIndex!==index))}>×</button>}</div>)}</fieldset><Button tone="secondary" type="button" disabled={options.length>=6} onClick={()=>setOptions(current=>[...current,""])}>+ Seçenek ekle</Button><p className="muted">Bu üniversitenin öğrencileri ve Tanıdıkları oy verebilir.</p><Button disabled={busy}>{busy?"Yayınlanıyor…":"Anketi yayınla"}</Button>{message&&<p role="status">{message}</p>}</form>;
}
