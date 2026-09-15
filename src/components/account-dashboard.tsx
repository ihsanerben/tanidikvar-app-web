"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, apiRequestAllPages } from "@/lib/client-api";
import { catalogSegment, questionSegment } from "@/lib/public-url";

type Item={id:string;targetType:string;targetId:string;createdAt?:string};
type Note=Item&{title:string;body:string;readAt:string|null};
type Page<T>={items:T[];totalElements:number};
type Resolved=Item&{label:string;detail:string;href:string;kind?:string;badge?:string};
type Question={id:string;title:string};type University={id:string;name:string};type Person={id:string;name:string;educationVerified?:boolean;universityName?:string|null;departmentName?:string|null;educationStatus?:string|null};type Program={id:string;universityId:string;universityName:string;departmentId:string;departmentName:string};

async function resolveItem(item:Item):Promise<Resolved>{
  try {
    if(item.targetType==="QUESTION"){const value=await apiRequest<Question>(`/questions/${item.targetId}`);return{...item,label:value.title,detail:"Soru",href:`/soru/${questionSegment(value.title,value.id)}`};}
    if(item.targetType==="UNIVERSITY"){const value=await apiRequest<University>(`/universities/${item.targetId}`);return{...item,label:value.name,detail:"Üniversite",href:`/universite/${catalogSegment(value.name,value.id)}`};}
    if(item.targetType==="TANIDIK"){const value=await apiRequest<Person>(`/tanidiklar/${item.targetId}`);return{...item,label:value.name,detail:[value.universityName,value.departmentName].filter(Boolean).join(" · ")||"Deneyim sahibi Tanıdık",badge:value.educationVerified?"Doğrulanmış Tanıdık":"Tanıdık",kind:"person",href:`/tanidik/${value.id}`};}
    if(item.targetType==="PROGRAM"){const programs=await apiRequestAllPages<Program>("/programs");const value=programs.find(program=>program.id===item.targetId);if(value)return{...item,label:value.departmentName,detail:value.universityName,href:`/universite/${catalogSegment(value.universityName,value.universityId)}/${catalogSegment(value.departmentName,value.departmentId)}`};}
  }catch{}
  return{...item,label:"İçerik",detail:"İçerik artık yayında olmayabilir",href:"/sorular"};
}

export function AccountDashboard({mode="all"}:{mode?:"all"|"saved"|"follows"|"notifications"}){
  const[saved,setSaved]=useState<Resolved[]|null>(null),[follows,setFollows]=useState<Resolved[]|null>(null),[notes,setNotes]=useState<Page<Note>|null>(null);
  useEffect(()=>{let active=true;void Promise.all([apiRequest<Page<Item>>("/me/saved?size=100"),apiRequest<Page<Item>>("/me/follows?size=100"),apiRequest<Page<Note>>("/me/notifications?size=100")]).then(async([s,f,n])=>{const[rs,rf]=await Promise.all([Promise.all(s.items.filter(item=>item.targetType==="QUESTION").map(resolveItem)),Promise.all(f.items.map(resolveItem))]);if(active){setSaved(rs);setFollows(rf);setNotes(n);}}).catch(()=>{if(active){setSaved([]);setFollows([]);setNotes({items:[],totalElements:0});}});return()=>{active=false};},[]);
  const list=(items:Resolved[]|null,empty:string)=>items===null?<p>Yükleniyor…</p>:items.length?<ul className="account-content-list">{items.map(item=><li className={item.kind==="person"?"account-person-item":""} key={item.id}><Link href={item.href}>{item.kind==="person"&&<span className="account-person-avatar" aria-hidden="true">{item.label.split(/\s+/).slice(0,2).map(part=>part[0]).join("")}</span>}<span><strong>{item.label}</strong>{item.badge&&<em>{item.badge}</em>}<small>{item.detail}</small></span><b aria-hidden="true">→</b></Link></li>)}</ul>:<p>{empty}</p>;
  const heading=(label:string)=>mode==="all"?<h2>{label}</h2>:null;
  return <div className="dashboard-grid">{(mode==="all"||mode==="follows")&&<section>{heading("Takipler")}{list(follows,"Henüz takip ettiğin bir içerik yok.")}</section>}{(mode==="all"||mode==="saved")&&<section>{heading("Kaydedilen sorular")}{list(saved,"Henüz kaydettiğin bir soru yok.")}</section>}{(mode==="all"||mode==="notifications")&&<section>{heading("Bildirimler")}{notes?.items.length?<ul className="notification-list">{notes.items.map(note=><li key={note.id} className={note.readAt?"":"unread"}><Link href={note.targetType==="QUESTION"?`/soru/${note.targetId}`:"/hesabim"}><strong>{note.title}</strong><span>{note.body}</span>{note.createdAt&&<time>{new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(note.createdAt))}</time>}</Link></li>)}</ul>:<p>Yeni bildirim yok.</p>}</section>}</div>;
}
