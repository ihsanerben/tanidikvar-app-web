import {TanidikStars} from "@/components/tanidik-stars";
import Link from "next/link";
import {getQuestions} from "@/lib/api/questions";
import {getTanidiklar} from "@/lib/api/profiles";
import {AskQuestionModal} from "@/components/ask-question-modal";
import {InfiniteResults} from "@/components/infinite-results";
import {PersonalQuestionFilter,type PersonalQuestionFilters} from "@/components/personal-question-filter";

type Props={universityId:string;departmentId?:string;programId?:string;view?:"all"|"questions"|"people";embedded?:boolean;showAsk?:boolean;initialProgramId?:string;openAsk?:boolean;filterPath?:string;filters?:PersonalQuestionFilters};

export async function ContextCommunity({universityId,departmentId,programId,view="all",embedded=false,showAsk=false,initialProgramId,openAsk=false,filterPath,filters={}}:Props){
 const query=(filters.q??"").trim().slice(0,150),sort=filters.sirala??"NEWEST";
 const questionFilters={scope:departmentId||programId?"UNIVERSITY_DEPARTMENT" as const:undefined,universityId,departmentId,programId,tagId:filters.tagId,sort};
 const apiQuery=new URLSearchParams({q:query,sort});Object.entries(questionFilters).forEach(([key,value])=>{if(value!==undefined&&value!=="")apiQuery.set(key,String(value));});
 const [questions,people]=await Promise.all([
  view==="people"?null:getQuestions(query,0,questionFilters).catch(()=>null),
  view==="questions"?null:getTanidiklar("",0,{universityId,departmentId}).catch(()=>null)
 ]);
 return <>
  {(view==="all"||view==="questions")&&<section id="sorular" className="content-section university-tab-panel">
   {!embedded&&<div className="section-heading"><h2>Sorular</h2></div>}
   <div className="context-question-toolbar">{showAsk&&<AskQuestionModal initialUniversityId={universityId} initialProgramId={programId??initialProgramId} defaultOpen={openAsk}/>}
   {filterPath&&<PersonalQuestionFilter path={filterPath} params={filters} hidden={{sekme:"sorular"}} contextLocked/>}</div>
   {!questions?<p role="alert">Sorular yüklenemedi. Sayfayı yenileyerek tekrar dene.</p>:questions.items.length?<InfiniteResults kind="questions" initial={questions.items} totalElements={questions.totalElements} path={`/questions?${apiQuery}`}/>:<div className="empty-state"><h3>{query?"Aramana uygun soru bulunamadı":"Henüz soru yok"}</h3><p>{query?"Filtreleri azaltmayı veya farklı bir arama denemeyi deneyebilirsin.":`${departmentId?"Bu program":"Bu üniversite"} hakkındaki ilk soruyu topluluğa yöneltebilirsin.`}</p></div>}
  </section>}
  {(view==="all"||view==="people")&&<section id="tanidiklar" className="content-section university-tab-panel">
   {!embedded&&<div className="section-heading"><h2>Tanıdıklar</h2></div>}
   {people?.items.length?<ul className="legacy-admin-grid context-people-grid">{people.items.slice(0,12).map(person=><li key={person.id}><Link className="legacy-admin-card" href={`/tanidik/${person.id}`}><span className={`legacy-admin-avatar role-${(person.educationStatus??"user").toLowerCase()}`}><span>{person.name.split(/\s+/).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR")}</span><TanidikStars educationStatus={person.educationStatus}/></span><div><h3>{person.name}</h3><p>{[person.departmentName,person.classYear?`${person.classYear}. sınıf`:person.graduationYear?`${person.graduationYear} mezunu`:null].filter(Boolean).join(" · ")}</p><b>Tanıdık</b><span>{person.tanidikAnswerCount} Tanıdık yorumu · {person.communityAnswerCount} topluluk yorumu</span></div></Link></li>)}</ul>:<div className="empty-state"><h3>Henüz Tanıdık yok</h3><p>Bu üniversitedeki öğrenciler ve mezunlar Tanıdık olduklarında burada görünecek.</p><Link className="button secondary" href="/hesabim/tanidik-basvurusu">Tanıdık ol</Link></div>}
  </section>}
 </>;
}
