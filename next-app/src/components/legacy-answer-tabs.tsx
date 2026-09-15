"use client";
import {useState,type ReactNode} from "react";

export function LegacyAnswerTabs({tanidikCount,communityCount,tanidik,community}:{tanidikCount:number;communityCount:number;tanidik:ReactNode;community:ReactNode}){
 const[first,setFirst]=useState(tanidikCount>0?"tanidik":"community");
 return <><div className="legacy-answer-tabs" role="tablist" aria-label="Yanıt türü"><button type="button" role="tab" aria-selected={first==="tanidik"} onClick={()=>setFirst("tanidik")}>Tanıdık yorumları ({tanidikCount})</button><button type="button" role="tab" aria-selected={first==="community"} onClick={()=>setFirst("community")}>Topluluk yorumları ({communityCount})</button></div><div role="tabpanel" hidden={first!=="tanidik"}>{tanidik}</div><div role="tabpanel" hidden={first!=="community"}>{community}</div></>;
}
