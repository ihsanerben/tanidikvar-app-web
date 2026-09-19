"use client";

import Link from "next/link";
import {useEffect,useId,useState,type KeyboardEvent} from "react";
import {apiRequest} from "@/lib/client-api";
import {catalogSegment,questionSegment} from "@/lib/public-url";
import {plainProgramName} from "@/lib/program-label";

type Page<T>={items:T[]};
type University={id:string;name:string};
type Program={id:string;universityId:string;universityName:string;departmentId:string;departmentName:string};
type Question={id:string;title:string};
type Person={id:string;name:string;universityName:string|null;departmentName:string|null};
type Results={universities:University[];programs:Program[];questions:Question[];people:Person[]};

export function GlobalSearch(){
 const id=useId(),[query,setQuery]=useState(""),[results,setResults]=useState<Results|null>(null),[active,setActive]=useState(-1);
 useEffect(()=>{
  if(query.trim().length<2){setResults(null);setActive(-1);return;}
  const controller=new AbortController(),timer=window.setTimeout(()=>{
   Promise.all([
    apiRequest<Page<University>>(`/universities?q=${encodeURIComponent(query)}&size=5`,{signal:controller.signal}),
    apiRequest<Page<Program>>(`/programs?q=${encodeURIComponent(query)}&size=5`,{signal:controller.signal}),
    apiRequest<Page<Question>>(`/questions?q=${encodeURIComponent(query)}&size=5`,{signal:controller.signal}),
    apiRequest<Page<Person>>(`/tanidiklar?q=${encodeURIComponent(query)}&size=5`,{signal:controller.signal})
   ]).then(([universities,programs,questions,people])=>setResults({universities:universities.items,programs:programs.items,questions:questions.items,people:people.items})).catch(()=>undefined);
  },250);
  return()=>{window.clearTimeout(timer);controller.abort();};
 },[query]);
 const entries=results?[
  ...results.universities.map(item=>({label:item.name,href:`/universite/${catalogSegment(item.name,item.id)}`})),
  ...results.programs.map(item=>{const name=plainProgramName(item.departmentName);return{label:`${item.universityName} · ${name}`,href:`/universite/${catalogSegment(item.universityName,item.universityId)}/${catalogSegment(name,item.departmentId)}`}}),
  ...results.questions.map(item=>({label:item.title,href:`/soru/${questionSegment(item.title,item.id)}`})),
  ...results.people.map(item=>({label:`${item.name} · ${plainProgramName(item.departmentName)||item.universityName||""}`,href:`/tanidik/${item.id}`}))
 ]:[];
 function keyboard(event:KeyboardEvent<HTMLInputElement>){if(!entries.length)return;if(event.key==="ArrowDown"){event.preventDefault();setActive(value=>(value+1)%entries.length);}if(event.key==="ArrowUp"){event.preventDefault();setActive(value=>(value<=0?entries.length:value)-1);}if(event.key==="Escape"){setResults(null);setActive(-1);}if(event.key==="Enter"&&active>=0){event.preventDefault();window.location.assign(entries[active].href);}}
 let offset=0;
 return <div className="search-combobox"><form className="search" action="/arama" role="search"><label className="sr-only" htmlFor={id}>Üniversite, bölüm, soru veya Tanıdık ara</label><input id={id} name="q" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={keyboard} placeholder="Üniversite, bölüm, soru veya Tanıdık ara" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={Boolean(results)} aria-activedescendant={active>=0?`${id}-option-${active}`:undefined} aria-controls={`${id}-results`}/><button>Ara</button></form>{results&&<div className="search-results" id={`${id}-results`} role="listbox" aria-label="Arama önerileri"><Result title="Üniversiteler" items={entries.slice(offset,offset+=results.universities.length)} start={offset-results.universities.length} id={id} active={active}/><Result title="Bölümler" items={entries.slice(offset,offset+=results.programs.length)} start={offset-results.programs.length} id={id} active={active}/><Result title="Sorular" items={entries.slice(offset,offset+=results.questions.length)} start={offset-results.questions.length} id={id} active={active}/><Result title="Tanıdıklar" items={entries.slice(offset)} start={offset} id={id} active={active}/>{entries.length===0&&<p>Sonuç bulunamadı.</p>}</div>}</div>;
}
function Result({title,items,start,id,active}:{title:string;items:{label:string;href:string}[];start:number;id:string;active:number}){if(!items.length)return null;return <section><h2>{title}</h2><ul>{items.map((item,index)=><li key={item.href} id={`${id}-option-${start+index}`} role="option" aria-selected={active===start+index}><Link href={item.href}>{item.label}</Link></li>)}</ul></section>}
