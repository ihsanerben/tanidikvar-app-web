"use client";
import Link from "next/link";
import {useEffect,useRef} from "react";
const tabs=[["genel","Genel"],["bolumler","Programlar"],["sorular","Sorular"],["tanidiklar","Tanıdıklar"],["istatistikler","İstatistikler"],["deneyimler","Deneyimler"],["anketler","Anketler"],["degerlendirmeler","Değerlendirmeler"],["olcumler","Ölçümler"]];
export function UniversityTabs({value,segment}:{value?:string;segment:string}) {
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>{const nav=ref.current,active=nav?.querySelector<HTMLElement>('[aria-current="page"]');if(nav&&active){const item=active.getBoundingClientRect(),container=nav.getBoundingClientRect();nav.scrollTo({left:nav.scrollLeft+item.left-container.left-(container.width-item.width)/2,behavior:'instant'});}},[value]);
 return <nav ref={ref} className="ui-tabs university-page-tabs" aria-label="Üniversite bölümleri">{tabs.map(([key,label])=><Link scroll={false} key={key} aria-current={value===key?"page":undefined} href={`/universite/${segment}?sekme=${key}`}>{label}</Link>)}</nav>;
}
