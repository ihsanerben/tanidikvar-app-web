import Link from "next/link";
import { getQuestions, QuestionApiError, type QuestionItem } from "@/lib/api/questions";
import { questionSegment } from "@/lib/public-url";
import {getAllUniversities,getUniversityDepartments} from "@/lib/api/catalog";
import {AskQuestionModal} from "@/components/ask-question-modal";
import {Button,ButtonLink} from "@/components/ui";
import {QuestionCard} from "@/components/question-card";
import {InfiniteResults} from "@/components/infinite-results";
import {PageTitle} from "@/components/page-title";

type Props = { searchParams: Promise<{ q?: string | string[]; sayfa?: string | string[]; scope?:string; universityId?:string; departmentId?:string; tagId?:string; city?:string; cevap?:string; dogrulanmis?:string; sirala?:string }> };
export async function generateMetadata({searchParams}:Props){const params=await searchParams;const filtered=Boolean(params.q||params.sayfa||params.universityId||params.departmentId);return{title:"Sorular",description:"Üniversite ve bölümler hakkında gerçek öğrencilere sorulan sorular.",robots:filtered?{index:false,follow:true}:undefined,alternates:{canonical:"/sorular"}};}
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const href = (page: number, current: URLSearchParams) => { const params = new URLSearchParams(current); if (page > 1) params.set("sayfa", String(page)); else params.delete("sayfa"); return params.size ? `/sorular?${params}` : "/sorular"; };
type FilterTag={id:string;name:string};
async function filterTags():Promise<FilterTag[]>{try{const load=async(page:number)=>{const url=new URL("/api/tags",process.env.API_BASE_URL??"http://localhost:8080");url.searchParams.set("page",String(page));url.searchParams.set("size","100");const response=await fetch(url,{cache:"no-store"});if(!response.ok)throw new Error("Tag kataloğu yüklenemedi.");return await response.json() as {items?:FilterTag[];totalElements?:number};};const first=await load(0),total=typeof first.totalElements==="number"?first.totalElements:0,pages=Math.ceil(total/100),remaining=await Promise.all(Array.from({length:Math.max(0,pages-1)},(_,index)=>load(index+1))),items=[first,...remaining].flatMap(result=>Array.isArray(result.items)?result.items.filter(item=>typeof item.id==="string"&&typeof item.name==="string"):[]);return items.toSorted((a,b)=>a.name.localeCompare(b.name,"tr",{sensitivity:"base"}));}catch{return[];}}

export default async function QuestionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim().slice(0, 200), currentPage = 1;
  const city=(params.city??"").trim().slice(0,120),answer=params.cevap,verified=params.dogrulanmis,sort=params.sirala??"NEWEST";
  const currentQuery=new URLSearchParams();Object.entries(params).forEach(([key,value])=>{const item=first(value);if(item)currentQuery.set(key,item);});
  const scope=["GENERAL","UNIVERSITY","UNIVERSITY_DEPARTMENT"].includes(params.scope??"")?params.scope as "GENERAL"|"UNIVERSITY"|"UNIVERSITY_DEPARTMENT":params.departmentId?"UNIVERSITY_DEPARTMENT":params.universityId?"UNIVERSITY":undefined;
  const [universities,departments,tags]=await Promise.all([getAllUniversities().catch(()=>[]),params.universityId?getUniversityDepartments(params.universityId).catch(()=>[]):Promise.resolve([]),filterTags()]);
  let questions;
  try { questions = await getQuestions(query,currentPage-1,{universityId:params.universityId,departmentId:params.departmentId,tagId:params.tagId,scope,city,answered:answer==="answered"?true:answer==="unanswered"?false:undefined,verifiedAnswer:verified==="yes"?true:verified==="no"?false:undefined,sort}); }
  catch(error){const message=error instanceof QuestionApiError?error.message:"Sorular yüklenirken beklenmeyen bir hata oluştu.";return <section className="legacy-questions questions-page"><div className="legacy-empty" role="alert"><h1>Sorular şu anda yüklenemiyor</h1><p>{message}</p><ButtonLink href={href(currentPage,currentQuery)}>Tekrar dene</ButtonLink></div></section>;}
  const apiQuery=new URLSearchParams({q:query,sort});Object.entries({universityId:params.universityId,departmentId:params.departmentId,tagId:params.tagId,scope,city,answered:answer==="answered"?true:answer==="unanswered"?false:undefined,verifiedAnswer:verified==="yes"?true:verified==="no"?false:undefined}).forEach(([key,value])=>{if(value!==undefined&&value!=="")apiQuery.set(key,String(value));});
  return <section className="legacy-questions questions-page">
    <div className="legacy-questions-heading"><PageTitle help="Soruları üniversite, bölüm, etiket ve cevap durumuna göre filtreleyebilir veya kendi sorunu yayınlayabilirsin.">Sorular</PageTitle><AskQuestionModal/></div>
    <form className="legacy-question-search" action="/sorular" role="search"><label className="sr-only" htmlFor="question-query">Soru ara</label><input id="question-query" name="q" defaultValue={query} placeholder="Soru ara"/><details data-close-on-outside><summary>Filtrele</summary><div className="legacy-filter-panel">
      <label>Soru kapsamı<select name="scope" defaultValue={scope??""}><option value="">Tüm kapsamlar</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite + Bölüm</option></select></label>
      <label>Üniversite<select name="universityId" defaultValue={params.universityId??""}><option value="">Tüm üniversiteler</option>{universities.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Bölüm<select name="departmentId" defaultValue={params.departmentId??""} disabled={!params.universityId}><option value="">Tüm bölümler</option>{departments.map(item=><option key={item.id} value={item.departmentId}>{item.departmentName}</option>)}</select></label>
      <label>Etiket<select name="tagId" defaultValue={params.tagId??""}><option value="">Tüm etiketler</option>{tags.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Şehir<input name="city" defaultValue={city} placeholder="Örn. İstanbul"/></label><label>Cevap durumu<select name="cevap" defaultValue={answer??""}><option value="">Tümü</option><option value="answered">Cevaplanmış</option><option value="unanswered">Cevap bekliyor</option></select></label><label>Doğrulanmış kişi cevabı<select name="dogrulanmis" defaultValue={verified??""}><option value="">Tümü</option><option value="yes">Var</option><option value="no">Yok</option></select></label><label>Sıralama<select name="sirala" defaultValue={sort}><option value="NEWEST">En yeni</option><option value="MOST_COMMENTED">En çok cevaplanan</option><option value="MOST_LIKED">En faydalı</option><option value="MOST_VIEWED">En çok görüntülenen</option><option value="OLDEST">En eski</option></select></label>
      <Link className="legacy-filter-clear" href="/sorular">Tümünü temizle</Link>
    </div></details><Button type="submit">Ara</Button></form>
    {questions.items.length?<InfiniteResults kind="questions" initial={questions.items} totalElements={questions.totalElements} path={`/questions?${apiQuery}`}/>:<div className="legacy-empty"><h2>{query?"Aramana uygun soru bulunamadı":"Henüz soru yok."}</h2><p>{query?"Filtreleri azaltmayı veya farklı bir arama denemeyi deneyebilirsin.":"İlk soruyu sen sorabilirsin."}</p><ButtonLink href="/soru-sor">İlk soruyu sor</ButtonLink></div>}
  </section>;
}
