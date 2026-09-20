import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ContextCommunity} from "@/components/context-community";
import {ProgramAcademicDetailsPanel} from "@/components/program-academic-details";
import {ProgramOptions} from "@/components/program-options";
import {RetentionActions} from "@/components/retention-actions";
import {ApiError,getCatalogProgram} from "@/lib/api/catalog";
import {catalogSegment} from "@/lib/public-url";

async function load(id:string){try{return await getCatalogProgram(id)}catch(error){if(error instanceof ApiError&&error.status===404)notFound();throw error}}
const number=(value:number|null,digits=0)=>value?.toLocaleString("tr-TR",{maximumFractionDigits:digits})??"Veri yok";

export async function generateMetadata({params}:{params:Promise<{programId:string}>}):Promise<Metadata>{
  const data=await load((await params).programId),s=data.summary;
  return{title:`${s.name} 2026 taban puanı ve başarı sırası · ${s.universityName}`,description:`2026 taban puanı ${number(s.currentMinimumScore,3)}, başarı sırası ${number(s.currentBestRank)}, kontenjan ${s.currentQuota}.`,alternates:{canonical:`/program/${s.id}`}};
}

export default async function ProgramPage({params}:{params:Promise<{programId:string}>}){
  const data=await load((await params).programId),s=data.summary,university=`/universite/${catalogSegment(s.universityName,s.universityId)}`,jsonLd={"@context":"https://schema.org","@type":"EducationalOccupationalProgram",name:s.name,provider:{"@type":"CollegeOrUniversity",name:s.universityName},timeToComplete:s.durationYears?`P${s.durationYears}Y`:undefined,educationalProgramMode:s.degreeLevel};
  return <main className="context-page program-detail"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/><nav className="breadcrumb"><Link href="/programlar">Programlar</Link><span>›</span><Link href={university}>{s.universityName}</Link><span>›</span><span>{s.name}</span></nav><header className="context-hero program-hero"><p className="eyebrow">{s.degreeLevel} · {s.scoreTypes.join(" / ")}</p><h1>{s.name}</h1><p className="lead">{s.universityName} · {s.city??"Şehir belirtilmemiş"} · {s.institutionType}</p><p>{s.faculties.join(" · ")}</p><RetentionActions targetType="PROGRAM" targetId={s.id} canSave={false}/></header><ProgramAcademicDetailsPanel details={data.academicDetails} options={data.options} isPrivate={s.institutionType==="VAKIF"}/><ProgramOptions options={data.options} name={s.name}/><ContextCommunity universityId={s.universityId} departmentId={s.departmentId??undefined} view="questions"/><p className="catalog-source-note">Kaynak: Resmî YÖK Atlas 2026 tercih kılavuzu ve Net Sihirbazı verileri.</p></main>;
}
