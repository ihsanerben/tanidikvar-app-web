"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef} from "react";

const items=[
 ["/sorular","Sorular",["/sorular","/soru/"]],
 ["/populer","Popülerler",["/populer"]],
 ["/universiteler","Üniversiteler",["/universiteler","/universite/"]],
 ["/programlar","Programlar",["/programlar","/program/"]],
 ["/tanidiklar","Tanıdıklar",["/tanidiklar","/tanidik/"]],
 ["/karsilastir","Karşılaştır",["/karsilastir"]],
 ["/siralama","Sıralama",["/siralama"]],
 ["/istatistikler","İstatistikler",["/istatistikler"]],
 ["/hakkimizda","Hakkımızda",["/hakkimizda"]],
] as const;

export function HeaderPrimaryNav(){
 const pathname=usePathname();
 const mobileMenu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{mobileMenu.current?.removeAttribute("open");},[pathname]);
 const links=(mobile=false)=>items.map(([href,label,prefixes])=>{const active=prefixes.some(prefix=>prefix.endsWith("/")?pathname.startsWith(prefix):pathname===prefix);return <Link href={href} className={active?"active":undefined} aria-current={active?"page":undefined} onClick={mobile?()=>mobileMenu.current?.removeAttribute("open"):undefined} key={href}>{label}</Link>;});
 return <><nav className="primary-nav" aria-label="Ana navigasyon">{links()}</nav><details ref={mobileMenu} className="mobile-nav"><summary aria-label="Ana menüyü aç"><span className="mobile-nav-icon" aria-hidden="true"><i/><i/><i/></span><span>Menü</span></summary><nav aria-label="Mobil navigasyon">{links(true)}</nav></details></>;
}
