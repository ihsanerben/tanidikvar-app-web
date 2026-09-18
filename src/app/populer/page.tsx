import Link from "next/link";
import { getPopularQuestions } from "@/lib/api/questions";
import {InfiniteResults} from "@/components/infinite-results";
import {PageTitle} from "@/components/page-title";

export const metadata = { title: "Popülerler", description: "Toplulukta en çok görüntülenen sorular.", alternates:{canonical:"/populer"} };

const periods=[{value:"DAILY",label:"Bugün"},{value:"WEEKLY",label:"Bu hafta"},{value:"MONTHLY",label:"Bu ay"},{value:"YEARLY",label:"Bu yıl"},{value:"ALL_TIME",label:"Tüm zamanlar"}] as const;
export default async function PopularPage({searchParams}:{searchParams:Promise<{sayfa?:string;donem?:string}>}) {
  const params=await searchParams,period=periods.some(item=>item.value===params.donem)?params.donem as typeof periods[number]["value"]:"ALL_TIME";
  const result = await getPopularQuestions(period, 0, 20),path=period==="ALL_TIME"?"/questions?sort=MOST_VIEWED":`/popular?period=${period}`;
  return <section className="legacy-questions questions-page">
    <div className="legacy-questions-heading"><PageTitle help="En çok ilgi gören soruları gün, hafta, ay, yıl veya tüm zamanlar aralığında inceleyebilirsin.">Popülerler</PageTitle></div>
    <nav className="leaderboard-periods popular-toolbar" aria-label="Popüler soruların tarih aralığı">{periods.map(item=><Link scroll={false} className={period===item.value?"active":""} aria-current={period===item.value?"page":undefined} href={`/populer?donem=${item.value}`} key={item.value}>{item.label}</Link>)}</nav>
    {result.items.length ? <InfiniteResults kind="questions" initial={result.items} totalElements={result.totalElements} path={path} pageSize={20}/> : <div className="legacy-empty"><h2>Bu dönemde popüler soru yok</h2><p>Sorular görüntülendikçe burada sıralanacak.</p></div>}
  </section>;
}
