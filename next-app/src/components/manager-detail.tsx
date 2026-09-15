"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

type Value = string | number | boolean | null | Value[] | { [key: string]: Value };
const labels: Record<string,string> = { id:"Kimlik",email:"E-posta",firstName:"Ad",lastName:"Soyad",displayName:"Ad soyad",educationStatus:"Eğitim durumu",authority:"Yetki",status:"Durum",title:"Başlık",body:"İçerik",reason:"Gerekçe",createdAt:"Oluşturulma",updatedAt:"Güncellenme",action:"İşlem",targetType:"Hedef türü" };
function DetailValue({value}:{value:Value}) { if(value===null)return <span>—</span>;if(Array.isArray(value))return <ul>{value.map((item,index)=><li key={index}><DetailValue value={item}/></li>)}</ul>;if(typeof value==="object")return <dl className="manager-detail-grid">{Object.entries(value).map(([key,item])=><div key={key}><dt>{labels[key]??key}</dt><dd><DetailValue value={item}/></dd></div>)}</dl>;return <span>{String(value)}</span>; }
export function ManagerDetail({title,path,back}:{title:string;path:string;back:string}) { const[data,setData]=useState<Value|null>(null),[error,setError]=useState("");useEffect(()=>{apiRequest<Value>(path).then(setData).catch(cause=>setError(cause instanceof Error?cause.message:"Kayıt yüklenemedi."));},[path]);return <section className="management-page manager-detail-page"><Link href={back}>← Listeye dön</Link><h1>{title}</h1>{error?<p role="alert">{error}</p>:data?<DetailValue value={data}/>:<p role="status">Yükleniyor…</p>}</section>; }
