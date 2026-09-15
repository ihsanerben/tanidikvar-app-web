"use client";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {apiRequest} from "@/lib/client-api";

type Account={firstName:string;lastName:string;email:string;version:number};

export function ManagerAccountForm(){
 const router=useRouter();
 const[account,setAccount]=useState<Account|null>(null),[message,setMessage]=useState("");
 useEffect(()=>{apiRequest<Account>("/manager/account").then(setAccount).catch(error=>setMessage(error instanceof Error?error.message:"Hesap bilgileri yüklenemedi."));},[]);
 async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!account)return;setMessage("");try{const form=new FormData(event.currentTarget),saved=await apiRequest<Account>("/manager/account",{method:"PUT",body:JSON.stringify({firstName:form.get("firstName"),lastName:form.get("lastName"),version:account.version})});setAccount(saved);setMessage("Bilgileriniz kaydedildi.");}catch(error){setMessage(error instanceof Error?error.message:"Bilgiler kaydedilemedi.");}}
 async function resetPassword(){if(!account)return;setMessage("");try{await apiRequest("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:account.email})});setMessage("Şifre yenileme bağlantısı e-posta adresinize gönderildi.");}catch(error){setMessage(error instanceof Error?error.message:"Bağlantı gönderilemedi.");}}
 async function logout(){await apiRequest("/auth/logout",{method:"POST"});router.push("/giris");router.refresh();}
 if(!account)return <p role="status">{message||"Yükleniyor…"}</p>;
 return <div className="manager-account-stack">
  <form className="auth-card manager-account-card" onSubmit={save}><h2>Yönetim kimliği</h2><label>Ad<input name="firstName" defaultValue={account.firstName} required maxLength={80}/></label><label>Soyad<input name="lastName" defaultValue={account.lastName} required maxLength={80}/></label><p>E-posta: <strong>{account.email}</strong></p><button className="button" type="submit">Bilgilerimi kaydet</button></form>
  <section className="auth-card manager-account-card"><h2>Hesap güvenliği</h2><p>E-posta adresin doğrulanmış.</p><button className="button secondary" type="button" onClick={resetPassword}>Şifre yenileme bağlantısı iste</button><button className="button manager-account-logout" type="button" onClick={logout}>Çıkış yap</button></section>
  {message&&<p className="manager-account-message" role="status">{message}</p>}
 </div>;
}
