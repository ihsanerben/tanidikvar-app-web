"use client";

import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {apiRequest} from "@/lib/client-api";
import {catalogSegment,questionSegment} from "@/lib/public-url";
import {ProgramCard} from "@/components/program-card";
import type {CatalogItem,PageResponse,ProgramSummary} from "@/lib/api/catalog";
import type {PublicTanidik} from "@/lib/api/profiles";
import type {QuestionItem} from "@/lib/api/questions";
import {QuestionCard} from "@/components/question-card";

type Kind="universities"|"programs"|"people"|"questions";
type Result=CatalogItem|ProgramSummary|PublicTanidik|QuestionItem;

export function InfiniteResults({kind,initial,totalElements,path,pageSize=24}:{kind:Kind;initial:Result[];totalElements:number;path:string;pageSize?:number}){
 const[items,setItems]=useState(initial),[page,setPage]=useState(0),[loading,setLoading]=useState(false),[failed,setFailed]=useState(false),sentinel=useRef<HTMLDivElement>(null),hasMore=items.length<totalElements;
 useEffect(()=>{setItems(initial);setPage(0);setFailed(false);},[initial,path]);
 useEffect(()=>{if(!hasMore||loading||failed)return;const node=sentinel.current;if(!node)return;const observer=new IntersectionObserver(entries=>{if(!entries[0]?.isIntersecting)return;setLoading(true);const nextPage=page+1,url=new URL(path,"http://local");url.searchParams.set("page",String(nextPage));url.searchParams.set("size",String(pageSize));void apiRequest<PageResponse<Result>>(`${url.pathname}${url.search}`).then(result=>{setItems(current=>[...current,...result.items.filter(next=>!current.some(item=>item.id===next.id))]);setPage(nextPage);}).catch(()=>setFailed(true)).finally(()=>setLoading(false));},{rootMargin:"500px"});observer.observe(node);return()=>observer.disconnect();},[failed,hasMore,loading,page,pageSize,path]);
 const content=kind==="universities"?<ul className="catalog-grid university-discovery-grid">{(items as CatalogItem[]).map(item=><li key={item.id}><h2><Link href={`/universite/${catalogSegment(item.name,item.id)}`}>{item.name}</Link></h2><p className="university-card-meta">{[item.city,institution(item.institutionType)].filter(Boolean).join(" · ")}</p><dl className="university-card-stats"><div><dt>Program</dt><dd>{item.programCount??0}</dd></div><div><dt>Soru</dt><dd>{item.questionCount??0}</dd></div><div><dt>Tanıdık</dt><dd>{item.tanidikCount??0}</dd></div></dl></li>)}</ul>:kind==="programs"?<div className="program-grid">{(items as ProgramSummary[]).map(item=><ProgramCard key={item.id} program={item}/>)}</div>:kind==="people"?<ul className="legacy-admin-grid">{(items as PublicTanidik[]).map(person=><li key={person.id}><Link className="legacy-admin-card" href={`/tanidik/${person.id}`}><span className={`legacy-admin-avatar role-${(person.educationStatus??"user").toLowerCase()}`}><span>{initials(person.name)}</span><i>★★★</i></span><div><h2>{person.name}</h2><p>{[person.universityName,person.departmentName,person.classYear?`${person.classYear}. sınıf`:person.graduationYear?`${person.graduationYear} mezunu`:null].filter(Boolean).join(" · ")}</p><b>Tanıdık</b><span><strong>{person.tanidikAnswerCount}</strong> Tanıdık yorumu · <strong>{person.communityAnswerCount}</strong> topluluk yorumu</span>{person.educationVerified&&<small>✓ Eğitim kimliği doğrulandı</small>}</div></Link></li>)}</ul>:<ul className="legacy-question-list">{(items as QuestionItem[]).map(item=><QuestionCard question={item} key={item.id}/>)}</ul>;
 return <>{content}<div className="infinite-sentinel" ref={sentinel} aria-live="polite">{loading&&<span>Yeni sonuçlar yükleniyor…</span>}{failed&&<button className="button secondary" type="button" onClick={()=>setFailed(false)}>Yüklemeyi tekrar dene</button>}{!hasMore&&items.length>0&&<span>Tüm sonuçlar gösterildi.</span>}</div></>;
}

function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR")}
function institution(value:CatalogItem["institutionType"]){return value==="DEVLET"?"Devlet":value==="VAKIF"?"Vakıf":value==="KKTC"?"KKTC":value==="YURT_DISI"?"Yurt dışı":null}
