"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

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
 return <nav className="primary-nav" aria-label="Ana navigasyon">{items.map(([href,label,prefixes])=>{const active=prefixes.some(prefix=>prefix.endsWith("/")?pathname.startsWith(prefix):pathname===prefix);return <Link href={href} className={active?"active":undefined} aria-current={active?"page":undefined} key={href}>{label}</Link>;})}</nav>;
}
