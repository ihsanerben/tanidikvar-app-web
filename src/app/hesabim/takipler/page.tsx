import Link from "next/link";
import {redirect} from "next/navigation";
import {authenticatedApi,currentUser} from "@/lib/session";
import {PageTitle} from "@/components/page-title";
import {getUniversity,getCatalogProgram} from "@/lib/api/catalog";
import {catalogSegment} from "@/lib/public-url";
export const metadata={title:"Takipler",robots:{index:false,follow:false}};
type Follow={id:string;targetType:string;targetId:string};
export default async function Page({searchParams}:{searchParams:Promise<{tur?:string;sayfa?:string}>}){
 if(!await currentUser())redirect("/giris");
 const params=await searchParams,program=params.tur==="program",page=Math.max(0,Math.min(10000,Number.parseInt(params.sayfa??"0",10)||0));
 const result=await authenticatedApi<{items:Follow[];totalElements:number}>(`/me/follows?targetType=${program?"PROGRAM":"UNIVERSITY"}&page=${page}&size=20`);
 const items=await Promise.all((result?.items??[]).map(async item=>{
  try{if(program){const value=(await getCatalogProgram(item.targetId)).summary;return{...item,label:value.name,detail:value.universityName,href:`/program/${value.id}`};}
  const value=await getUniversity(item.targetId);return{...item,label:value.name,detail:"Üniversite",href:`/universite/${catalogSegment(value.name,value.id)}`};}catch{return{...item,label:"İçerik yüklenemedi",detail:"Tekrar denemek için sayfayı yenile.",href:""};}
 }));
 const href=(type:string,index=0)=>`/hesabim/takipler?tur=${type}&sayfa=${index}`;
 return <section className="legacy-account-page"><Link href="/hesabim">← Hesabıma dön</Link><PageTitle help="Takip ettiğin üniversite ve programlara buradan ulaşabilirsin.">Takipler</PageTitle>
 <nav className="account-content-tabs" aria-label="Takip türü"><Link href={href("universite")} className={!program?"active":""} aria-current={!program?"page":undefined}>Üniversite</Link><Link href={href("program")} className={program?"active":""} aria-current={program?"page":undefined}>Bölüm</Link></nav>
 {!result?<p role="alert">Takiplerin yüklenemedi. Sayfayı yenileyerek tekrar dene.</p>:items.length?<ul className="account-content-list">{items.map(item=><li key={item.id}>{item.href?<Link href={item.href}><span><strong>{item.label}</strong><small>{item.detail}</small></span><b aria-hidden="true">→</b></Link>:<p>{item.label} · {item.detail}</p>}</li>)}</ul>:<p>Henüz takip ettiğin {program?"bir bölüm":"bir üniversite"} yok.</p>}
 <nav className="pagination" aria-label="Takip sayfaları">{page>0&&<Link href={href(program?"program":"universite",page-1)}>Önceki</Link>}{(page+1)*20<(result?.totalElements??0)&&<Link href={href(program?"program":"universite",page+1)}>Sonraki</Link>}</nav>
 </section>;
}
