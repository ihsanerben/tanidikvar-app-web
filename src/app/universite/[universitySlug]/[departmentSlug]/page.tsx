import type {Metadata} from "next";
import Link from "next/link";
import {notFound,permanentRedirect} from "next/navigation";
import {ApiError,getEducation} from "@/lib/api/catalog";
import {catalogIdFromSegment,catalogSegment} from "@/lib/public-url";
import {ContextInsights} from "@/components/context-insights";
import {RetentionActions} from "@/components/retention-actions";
import {ContextCommunity} from "@/components/context-community";

type Props={params:Promise<{universitySlug:string;departmentSlug:string}>};
async function resolveEducation(universitySegment:string,departmentSegment:string){const universityId=catalogIdFromSegment(universitySegment),departmentId=catalogIdFromSegment(departmentSegment);if(!universityId||!departmentId)notFound();try{return await getEducation(universityId,departmentId);}catch(error){if(error instanceof ApiError&&error.status===404)notFound();throw error;}}

export async function generateMetadata({params}:Props):Promise<Metadata>{const{universitySlug,departmentSlug}=await params,education=await resolveEducation(universitySlug,departmentSlug),canonical=`/universite/${catalogSegment(education.universityName,education.universityId)}/${catalogSegment(education.departmentName,education.departmentId)}`,title=`${education.departmentName} · ${education.universityName}`,description=`${education.universityName} ${education.departmentName} programı hakkında sorular, doğrulanmış öğrenci deneyimleri, değerlendirmeler ve istatistikler.`;return{title,description,alternates:{canonical},openGraph:{title,description,url:canonical,type:"website"}};}

export default async function DepartmentPage({params}:Props){
 const{universitySlug,departmentSlug}=await params,education=await resolveEducation(universitySlug,departmentSlug),currentUniversity=catalogSegment(education.universityName,education.universityId),currentDepartment=catalogSegment(education.departmentName,education.departmentId);
 if(universitySlug!==currentUniversity||departmentSlug!==currentDepartment)permanentRedirect(`/universite/${currentUniversity}/${currentDepartment}`);
 const canonical=`/universite/${currentUniversity}/${currentDepartment}`,guideContext=`universityId=${education.universityId}&departmentId=${education.departmentId}&programId=${education.id}`;
 const jsonLd={"@context":"https://schema.org","@type":"EducationalOccupationalProgram",name:education.departmentName,provider:{"@type":"CollegeOrUniversity",name:education.universityName},url:canonical};
 return <article className="context-page university-theme"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/>
  <nav className="breadcrumb" aria-label="İçerik yolu"><Link href="/universiteler">Üniversiteler</Link><span aria-hidden="true">›</span><Link href={`/universite/${currentUniversity}`}>{education.universityName}</Link><span aria-hidden="true">›</span><span>{education.departmentName}</span></nav>
  <header className="context-hero"><p className="eyebrow">{education.universityName}</p><h1>{education.departmentName}</h1><p>Bu programa özel sorular, öğrenciler, mezunlar ve karar verileri burada toplanır.</p><RetentionActions targetType="PROGRAM" targetId={education.id} canSave={false}/></header>
  <nav className="tabs" aria-label="Program bölümleri"><a href="#genel">Genel</a><a href="#sorular">Sorular</a><a href="#degerlendirmeler">Değerlendirmeler</a><a href="#anketler">Anketler</a><a href="#tanidiklar">Tanıdıklar</a></nav>
  <ContextInsights universityId={education.universityId} programId={education.id}/><ContextCommunity universityId={education.universityId} departmentId={education.departmentId}/>
 </article>;
}
