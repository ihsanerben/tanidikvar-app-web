import Link from "next/link";
import { GamificationHelp } from "@/components/gamification-help";

export type Gamification = { userId:string; totalPoints:number; eventCount:number; title:string; badges:string[]; expertise:string[]; lastEventAt:string|null };
type Report = { year:number; points:number; pointEvents:number; answers:number; bestAnswers:number; usefulVotes:number; evaluations:number; experiences:number; percentile:number };

async function json<T>(path:string):Promise<T|null> {
  try { const response=await fetch(new URL(path,process.env.API_BASE_URL??"http://localhost:8080"),{cache:"no-store"});return response.ok?response.json():null; }
  catch { return null; }
}

export async function GamificationCard({userId}:{userId:string}) {
  const [score,report]=await Promise.all([json<Gamification>(`/api/gamification/profiles/${userId}`),json<Report>(`/api/gamification/profiles/${userId}/annual-report`)]);
  if(!score)return null;
  return <section className="gamification-card" aria-label="Katkı seviyesi">
    <div className="gamification-heading"><p className="eyebrow">Katkı seviyesi</p><GamificationHelp/></div>
    <h2>{score.title}</h2><p className="gamification-score"><strong>{score.totalPoints.toLocaleString("tr-TR")} puan</strong><span>{score.eventCount} katkı olayı</span></p>
    {score.badges.length>0&&<div><h3>Öne çıkan rozetler</h3><p className="badge-row">{score.badges.map(badge=><span className="badge" key={badge}>{badge}</span>)}</p></div>}
    {score.expertise.length>0&&<div><h3>Uzmanlık alanları</h3><p className="tag-row">{score.expertise.map(item=><span key={item}>{item}</span>)}</p></div>}
    {report&&<details><summary>{report.year} Tanıdık Karnesi</summary><p>{report.points} puan · {report.answers} cevap · {report.bestAnswers} en iyi cevap · {report.usefulVotes} faydalı oy</p><span>Topluluğun %{report.percentile.toLocaleString("tr-TR",{maximumFractionDigits:1})} diliminde</span><p><Link className="button secondary" href={`/tanidik/${userId}/karne`}>Paylaşılabilir karneyi aç</Link></p></details>}
  </section>;
}
