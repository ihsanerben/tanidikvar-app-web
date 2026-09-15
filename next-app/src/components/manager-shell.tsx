"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState,type ReactNode} from "react";

const links=[
 ["/yonetim","Özet"],
 ["/yonetim/analitik","Grafikler"],
 ["/yonetim/basvurular","Başvurular"],
 ["/yonetim/kullanicilar","Kullanıcılar"],
 ["/yonetim/icerik","Sorular ve Yorumlar"],
 ["/yonetim/raporlar","Şikâyetler"],
 ["/yonetim/katalog","Üniversiteler ve Bölümler"],
 ["/yonetim/tagler","Tagler"],
 ["/yonetim/islemler","İşlem Geçmişi"],
 ["/yonetim/hesabim","Hesabım"],
] as const;

export function ManagerShell({children}:{children:ReactNode}){
 const pathname=usePathname(),[openedPath,setOpenedPath]=useState<string|null>(null),toggle=useRef<HTMLButtonElement>(null),open=openedPath===pathname;
 const setOpen=(value:boolean|((value:boolean)=>boolean))=>setOpenedPath((typeof value==='function'?value(open):value)?pathname:null);
 useEffect(()=>{if(!open)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpenedPath(null);toggle.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[open]);
 return <div className="manager-shell"><a className="skip-link" href="#manager-main">İçeriğe geç</a><header className="manager-header"><button ref={toggle} className="manager-menu-toggle" aria-expanded={open} aria-controls="manager-sidebar" onClick={()=>setOpen(value=>!value)}>Menü</button><Link href="/yonetim" className="manager-brand">tanıdıkvar <span>Yönetim</span></Link><Link href="/yonetim/hesabim">Yönetim hesabım</Link></header><aside id="manager-sidebar" className={`manager-sidebar${open?" is-open":""}`}><p>YÖNETİM PANELİ</p><nav aria-label="Yönetim menüsü">{links.map(([href,label])=><Link key={href} aria-current={pathname===href||(href!=="/yonetim"&&pathname.startsWith(href+"/"))?"page":undefined} className={pathname===href||(href!=="/yonetim"&&pathname.startsWith(href+"/"))?"active":""} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}</nav></aside><main id="manager-main" className="manager-main">{children}</main></div>;
}
