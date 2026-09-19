import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ApiError, getAllCatalogPrograms, getUniversity, getUniversityCatalogStatistics } from "@/lib/api/catalog";
import { catalogIdFromSegment, catalogSegment } from "@/lib/public-url";
import { RetentionActions } from "@/components/retention-actions";
import { ContextInsights } from "@/components/context-insights";
import { ContextCommunity } from "@/components/context-community";
import type { CSSProperties } from "react";
import {ProgramCard} from "@/components/program-card";
import {Distribution,MetricCards,YearlyTable} from "@/components/catalog-statistics";

type Props = { params: Promise<{ universitySlug: string }>; searchParams?:Promise<{sekme?:string;q?:string;puan?:string;duzey?:string;sirala?:"NAME"|"RANK"}> };

async function resolveUniversity(segment: string) {
  const id = catalogIdFromSegment(segment);
  if (!id) notFound();
  try { return await getUniversity(id); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universitySlug } = await params;
  const university = await resolveUniversity(universitySlug);
  const description=`${university.name} programları, soruları ve öğrenci deneyimleri.`;return { title: university.name, description, alternates: { canonical: `/universite/${catalogSegment(university.name, university.id)}` },openGraph:{title:university.name,description} };
}

export default async function UniversityPage({ params,searchParams }: Props) {
  const { universitySlug } = await params;
  const university = await resolveUniversity(universitySlug);
  const canonicalSegment = catalogSegment(university.name, university.id);
  if (universitySlug !== canonicalSegment) permanentRedirect(`/universite/${canonicalSegment}`);
  const query=await searchParams,requested=query?.sekme,tab=["genel","sorular","bolumler","istatistikler","degerlendirmeler","anketler","tanidiklar"].includes(requested??"")?requested:"genel";
  const [programs,statistics]=await Promise.all([getAllCatalogPrograms({universityId:university.id,query:query?.q,scoreType:query?.puan,degreeLevel:query?.duzey,sort:query?.sirala??"RANK"}),getUniversityCatalogStatistics(university.id)]);
  const theme={"--university-primary":university.accentPrimary??"var(--brand)","--university-soft":university.accentSoft??"var(--brand-soft)","--university-foreground":university.accentForeground??"#ffffff"} as CSSProperties;
  const jsonLd={"@context":"https://schema.org","@type":"CollegeOrUniversity",name:university.name,address:university.city?{"@type":"PostalAddress",addressLocality:university.city,addressCountry:"TR"}:undefined,url:`/universite/${canonicalSegment}`,sameAs:university.websiteUrl?[university.websiteUrl]:undefined};return <article className="context-page university-theme" style={theme}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/>
    <nav className="breadcrumb" aria-label="İçerik yolu"><Link href="/universiteler">Üniversiteler</Link><span aria-hidden="true">›</span><span>{university.name}</span></nav>
    <header className="context-hero">{university.logoUrl&&<img className="university-logo" src={university.logoUrl} alt={`${university.name} logosu`} width="80" height="80"/>}<p className="eyebrow">{[university.city,university.institutionType].filter(Boolean).join(" · ")||"Üniversite topluluğu"}</p><h1>{university.name}</h1><p>{university.description??"Programlar ve bu üniversiteye ait topluluk içerikleri tek bağlamda."}</p>{university.websiteUrl&&<p><a href={university.websiteUrl} rel="noreferrer">Resmî web sitesi</a></p>}<RetentionActions targetType="UNIVERSITY" targetId={university.id} canSave={false}/></header>
    <nav className="tabs university-page-tabs" aria-label="Üniversite bölümleri">{[["genel","Genel"],["bolumler","Programlar"],["istatistikler","İstatistikler"],["sorular","Sorular"],["degerlendirmeler","Değerlendirmeler"],["anketler","Anketler"],["tanidiklar","Tanıdıklar"]].map(([value,label])=><Link scroll={false} key={value} aria-current={tab===value?"page":undefined} href={`/universite/${canonicalSegment}?sekme=${value}`}>{label}</Link>)}</nav>
    {(tab==="genel"||tab==="degerlendirmeler"||tab==="anketler")&&<ContextInsights universityId={university.id} view={tab} embedded/>}
    {tab==="sorular"&&<ContextCommunity universityId={university.id} view="questions" embedded showAsk/>}
    {tab==="tanidiklar"&&<ContextCommunity universityId={university.id} view="people" embedded/>}
    {tab==="bolumler"&&<section id="bolumler" className="content-section">
      <form className="program-filter discovery-filter"><input type="hidden" name="sekme" value="bolumler"/><label>Program ara<input name="q" defaultValue={query?.q??""}/></label><label>Puan türü<select name="puan" defaultValue={query?.puan??""}><option value="">Tümü</option>{["TYT","SAY","EA","SÖZ","DİL"].map(value=><option key={value}>{value}</option>)}</select></label><label>Düzey<select name="duzey" defaultValue={query?.duzey??""}><option value="">Tümü</option><option value="LISANS">Lisans</option><option value="ONLISANS">Ön lisans</option></select></label><label className="sort-field">Sırala<select name="sirala" defaultValue={query?.sirala??"RANK"}><option value="RANK">Başarı sırasına göre</option><option value="NAME">Ada göre</option></select></label><button className="button">Filtrele</button></form>
      {programs.length ? <div className="program-grid">{programs.map(program=><ProgramCard key={program.id} program={program} showUniversity={false}/>)}</div> : <div className="empty-state"><h3>Aktif program bulunmuyor</h3><p>Programlar veri aktarımından sonra burada görünecek.</p></div>}
    </section>}
    {tab==="istatistikler"&&<section className="content-section"><MetricCards items={[{label:"Akademik birim",value:statistics.facultyCount},{label:"Program",value:statistics.programCount},{label:"Yerleştirme seçeneği",value:statistics.optionCount}]}/><div className="catalog-chart-grid"><Distribution title="Program düzeyleri" items={statistics.degreeLevels}/><Distribution title="Puan türleri" items={statistics.scoreTypes}/><Distribution title="Fakülte ve MYO programları" items={statistics.academicUnits}/><Distribution title="En iyi başarı sırasıyla alan programlar" items={statistics.bestRankedPrograms.map(item=>({label:item.name,count:item.currentBestRank??0})).filter(item=>item.count>0)}/></div><YearlyTable items={statistics.yearly}/></section>}
  </article>;
}
