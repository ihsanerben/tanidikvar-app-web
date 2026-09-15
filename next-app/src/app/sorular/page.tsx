import Link from "next/link";
import { getQuestions, QuestionApiError, type QuestionItem } from "@/lib/api/questions";
import { questionSegment } from "@/lib/public-url";
import {getUniversities,getUniversityDepartments} from "@/lib/api/catalog";
import {AskQuestionModal} from "@/components/ask-question-modal";
import {Button,ButtonLink} from "@/components/ui";

type Props = { searchParams: Promise<{ q?: string | string[]; sayfa?: string | string[]; scope?:string; universityId?:string; departmentId?:string; tagId?:string; city?:string; cevap?:string; dogrulanmis?:string; sirala?:string }> };
export async function generateMetadata({searchParams}:Props){const params=await searchParams;const filtered=Boolean(params.q||params.sayfa||params.universityId||params.departmentId);return{title:"Sorular",description:"Üniversite ve bölümler hakkında gerçek öğrencilere sorulan sorular.",robots:filtered?{index:false,follow:true}:undefined,alternates:{canonical:"/sorular"}};}
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const pageFrom = (value: string | undefined) => { const parsed = Number.parseInt(value ?? "1", 10); return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10_001) : 1; };
const href = (page: number, current: URLSearchParams) => { const params = new URLSearchParams(current); if (page > 1) params.set("sayfa", String(page)); else params.delete("sayfa"); return params.size ? `/sorular?${params}` : "/sorular"; };
const date = (value:string) => new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));
const initials = (name:string) => name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR");
const scopeText = (question:QuestionItem) => question.scope === "GENERAL" ? "" : [question.universityName,question.departmentName].filter(Boolean).join(" · ");
type FilterTag={id:string;name:string};
async function filterTags():Promise<FilterTag[]>{try{const response=await fetch(new URL("/api/tags?size=100",process.env.API_BASE_URL??"http://localhost:8080"),{cache:"no-store"});if(!response.ok)return[];const payload=await response.json() as {items?:FilterTag[]};return Array.isArray(payload.items)?payload.items.filter(item=>typeof item.id==="string"&&typeof item.name==="string"):[];}catch{return[];}}

function StatIcon({type}:{type:"view"|"like"|"answer"}) {
  if(type==="view") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>;
  if(type==="like") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v12H9l-5 4v-16Z"/></svg>;
}

export function QuestionCard({question}:{question:QuestionItem}) {
  const scope=question.scope.toLowerCase();
  return <li><article className="legacy-question-card">
    <div className="legacy-question-context"><span className={`legacy-scope-badge scope-${scope}${question.scope==="GENERAL"?" scope-dot-only":""}`} aria-label={question.scope==="GENERAL"?"Genel soru":scopeText(question)}>{scopeText(question)}</span>{question.tags.filter(tag=>tag.available).map(tag=><span className="legacy-question-tag" key={tag.id}>#{tag.name}</span>)}</div>
    <h2><Link href={`/soru/${questionSegment(question.title, question.id)}`}>{question.title}</Link></h2>
    {question.body&&<p className="legacy-question-excerpt">{question.body}</p>}
    <div className="legacy-question-bottom"><div className="legacy-byline"><span className={`legacy-avatar role-${(question.educationStatus??"user").toLowerCase()}${question.activeAdmin?" is-tanidik":""}`} aria-hidden="true"><span>{initials(question.authorName)}</span>{question.activeAdmin&&<i>★★★</i>}</span><span>{question.authorName}</span><time dateTime={question.createdAt}>{date(question.createdAt)}</time></div><div className="legacy-question-stats"><span aria-label={`${question.statistics.viewCount} görüntülenme`}><StatIcon type="view"/>{question.statistics.viewCount}</span><span aria-label={`${question.statistics.likeCount} faydalı oy`}><StatIcon type="like"/>{question.statistics.likeCount}</span><span aria-label={`${question.statistics.totalAnswerCount} yorum`}><StatIcon type="answer"/>{question.statistics.totalAnswerCount}</span></div></div>
  </article></li>;
}

export default async function QuestionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim().slice(0, 200), currentPage = pageFrom(first(params.sayfa));
  const city=(params.city??"").trim().slice(0,120),answer=params.cevap,verified=params.dogrulanmis,sort=params.sirala??"NEWEST";
  const currentQuery=new URLSearchParams();Object.entries(params).forEach(([key,value])=>{const item=first(value);if(item)currentQuery.set(key,item);});
  const scope=["GENERAL","UNIVERSITY","UNIVERSITY_DEPARTMENT"].includes(params.scope??"")?params.scope as "GENERAL"|"UNIVERSITY"|"UNIVERSITY_DEPARTMENT":params.departmentId?"UNIVERSITY_DEPARTMENT":params.universityId?"UNIVERSITY":undefined;
  const [universities,departments,tags]=await Promise.all([getUniversities({size:100}).catch(()=>null),params.universityId?getUniversityDepartments(params.universityId).catch(()=>[]):Promise.resolve([]),filterTags()]);
  let questions;
  try { questions = await getQuestions(query,currentPage-1,{universityId:params.universityId,departmentId:params.departmentId,tagId:params.tagId,scope,city,answered:answer==="answered"?true:answer==="unanswered"?false:undefined,verifiedAnswer:verified==="yes"?true:verified==="no"?false:undefined,sort}); }
  catch(error){const message=error instanceof QuestionApiError?error.message:"Sorular yüklenirken beklenmeyen bir hata oluştu.";return <section className="legacy-questions questions-page"><div className="legacy-empty" role="alert"><h1>Sorular şu anda yüklenemiyor</h1><p>{message}</p><ButtonLink href={href(currentPage,currentQuery)}>Tekrar dene</ButtonLink></div></section>;}
  const totalPages=Math.ceil(questions.totalElements/questions.size);
  return <section className="legacy-questions questions-page">
    <div className="legacy-questions-heading"><h1>Sorular</h1><AskQuestionModal/></div>
    <form className="legacy-question-search" action="/sorular" role="search"><label className="sr-only" htmlFor="question-query">Soru ara</label><input id="question-query" name="q" defaultValue={query} placeholder="Soru ara"/><details><summary>Filtrele</summary><div className="legacy-filter-panel">
      <label>Soru kapsamı<select name="scope" defaultValue={scope??""}><option value="">Tüm kapsamlar</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite + Bölüm</option></select></label>
      <label>Üniversite<select name="universityId" defaultValue={params.universityId??""}><option value="">Tüm üniversiteler</option>{universities?.items.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Bölüm<select name="departmentId" defaultValue={params.departmentId??""} disabled={!params.universityId}><option value="">Tüm bölümler</option>{departments.map(item=><option key={item.id} value={item.departmentId}>{item.departmentName}</option>)}</select></label>
      <label>Etiket<select name="tagId" defaultValue={params.tagId??""}><option value="">Tüm etiketler</option>{tags.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Şehir<input name="city" defaultValue={city} placeholder="Örn. İstanbul"/></label><label>Cevap durumu<select name="cevap" defaultValue={answer??""}><option value="">Tümü</option><option value="answered">Cevaplanmış</option><option value="unanswered">Cevap bekliyor</option></select></label><label>Doğrulanmış kişi cevabı<select name="dogrulanmis" defaultValue={verified??""}><option value="">Tümü</option><option value="yes">Var</option><option value="no">Yok</option></select></label><label>Sıralama<select name="sirala" defaultValue={sort}><option value="NEWEST">En yeni</option><option value="MOST_COMMENTED">En çok cevaplanan</option><option value="MOST_LIKED">En faydalı</option><option value="MOST_VIEWED">En çok görüntülenen</option><option value="OLDEST">En eski</option></select></label>
      <Link className="legacy-filter-clear" href="/sorular">Tümünü temizle</Link>
    </div></details><Button type="submit">Ara</Button></form>
    {questions.items.length?<><ul className="legacy-question-list">{questions.items.map(question=><QuestionCard key={question.id} question={question}/>)}</ul>{totalPages>1&&<nav className="legacy-pagination" aria-label="Soru sayfaları">{currentPage>1&&<Link href={href(currentPage-1,currentQuery)}>Önceki sayfa</Link>}<span>{questions.totalElements} soru · Sayfa {currentPage}</span>{currentPage<totalPages&&<Link href={href(currentPage+1,currentQuery)}>Sonraki sayfa</Link>}</nav>}</>:<div className="legacy-empty"><h2>{query?"Aramana uygun soru bulunamadı":"Henüz soru yok."}</h2><p>{query?"Filtreleri azaltmayı veya farklı bir arama denemeyi deneyebilirsin.":"İlk soruyu sen sorabilirsin."}</p><ButtonLink href="/soru-sor">İlk soruyu sor</ButtonLink></div>}
  </section>;
}
