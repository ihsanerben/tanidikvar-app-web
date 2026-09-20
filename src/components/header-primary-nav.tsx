"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef} from "react";

const items=[
 ["/sorular","Soru",["/sorular","/soru/"]],
 ["/populer","Popüler",["/populer"]],
 ["/universiteler","Üniversite",["/universiteler","/universite/"]],
 ["/programlar","Program",["/programlar","/program/"]],
 ["/karsilastir","Karşılaştır",["/karsilastir"]],
 ["/tanidiklar","Tanıdık",["/tanidiklar","/tanidik/"]],
 ["/siralama","Sıralama",["/siralama"]],
 ["/istatistikler","İstatistik",["/istatistikler"]],
 ["/hakkimizda","Hakkımızda",["/hakkimizda"]],
] as const;

export function HeaderPrimaryNav(){
 const pathname=usePathname();
 const mobileMenu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{mobileMenu.current?.removeAttribute("open");},[pathname]);
 useEffect(()=>{const close=(event:PointerEvent)=>{if(mobileMenu.current?.open&&!mobileMenu.current.contains(event.target as Node))mobileMenu.current.removeAttribute("open");};document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close);},[]);
 const links=(mobile=false)=>items.map(([href,label,prefixes])=>{const active=prefixes.some(prefix=>prefix.endsWith("/")?pathname.startsWith(prefix):pathname===prefix);return <Link href={href} className={active?"active":undefined} aria-current={active?"page":undefined} onClick={mobile?()=>mobileMenu.current?.removeAttribute("open"):undefined} key={href}>{label}</Link>;});
 return <><nav className="primary-nav" aria-label="Ana navigasyon">{links()}</nav><details ref={mobileMenu} className="mobile-nav" data-close-on-outside><summary aria-label="Ana menüyü aç"><span className="mobile-nav-icon" aria-hidden="true"><i/><i/><i/></span><span>Menü</span></summary><nav aria-label="Mobil navigasyon">{links(true)}</nav></details></>;
}
