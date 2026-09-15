import Link from "next/link";
import {getCatalogPrograms,getUniversities} from "@/lib/api/catalog";
import {getQuestions} from "@/lib/api/questions";
import {getTanidiklar} from "@/lib/api/profiles";
import {catalogSegment,questionSegment} from "@/lib/public-url";

export async function generateMetadata(){return{title:"Arama",robots:{index:false,follow:true},alternates:{canonical:"/arama"}};}
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const query=((await searchParams).q??"").trim().slice(0,200);
 const [universities,programs,questions,people]=query?await Promise.all([getUniversities({query,size:8}).catch(()=>null),getCatalogPrograms({query,size:8}).catch(()=>null),getQuestions(query,0).catch(()=>null),getTanidiklar(query,0).catch(()=>null)]):[null,null,null,null];
 return <section className="content-section"><p className="eyebrow">Global keşif</p><h1>Arama</h1><form className="catalog-search" role="search"><label>Üniversite, program, soru veya Tanıdık<input name="q" defaultValue={query} required/></label><button className="button">Ara</button></form>{query&&<><h2>Üniversiteler</h2><ul className="catalog-grid">{universities?.items.map(item=><li key={item.id}><Link href={`/universite/${catalogSegment(item.name,item.id)}`}>{item.name}</Link></li>)}</ul><h2>Programlar</h2><ul className="catalog-grid">{programs?.items.map(item=><li key={item.id}><Link href={`/program/${item.id}`}>{item.name}</Link><p>{item.universityName} · {item.city}</p></li>)}</ul><h2>Sorular</h2><ul className="question-list">{questions?.items.slice(0,8).map(item=><li key={item.id}><Link href={`/soru/${questionSegment(item.title,item.id)}`}>{item.title}</Link></li>)}</ul><h2>Tanıdıklar</h2><ul className="catalog-grid">{people?.items.slice(0,8).map(item=><li key={item.id}><Link href={`/tanidik/${item.id}`}>{item.name}</Link><p>{[item.universityName,item.departmentName].filter(Boolean).join(" · ")}</p></li>)}</ul></>}</section>;
}
