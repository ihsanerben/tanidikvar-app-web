import Link from "next/link";
import { getPopularQuestions } from "@/lib/api/questions";
import { QuestionCard } from "@/app/sorular/page";
import {AskQuestionModal} from "@/components/ask-question-modal";

export const metadata = { title: "Popülerler", description: "Toplulukta en çok görüntülenen sorular." };
const pageNumber = (value?: string) => { const parsed = Number.parseInt(value ?? "1", 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : 1; };

const periods=[{value:"DAILY",label:"Bugün"},{value:"WEEKLY",label:"Bu hafta"},{value:"MONTHLY",label:"Bu ay"},{value:"YEARLY",label:"Bu yıl"},{value:"ALL_TIME",label:"Tüm zamanlar"}] as const;
export default async function PopularPage({searchParams}:{searchParams:Promise<{sayfa?:string;donem?:string}>}) {
  const params=await searchParams,current = pageNumber(params.sayfa),period=periods.some(item=>item.value===params.donem)?params.donem as typeof periods[number]["value"]:"ALL_TIME";
  const result = await getPopularQuestions(period, current - 1, 20);
  const pages = Math.ceil(result.totalElements / result.size);
  return <section className="legacy-questions questions-page">
    <div className="legacy-questions-heading"><div><h1>Popülerler</h1></div><AskQuestionModal/></div>
    <nav className="leaderboard-periods" aria-label="Popüler soruların tarih aralığı">{periods.map(item=><Link scroll={false} className={period===item.value?"active":""} aria-current={period===item.value?"page":undefined} href={`/populer?donem=${item.value}`} key={item.value}>{item.label}</Link>)}</nav>
    {result.items.length ? <><ul className="legacy-question-list">{result.items.map(question => <QuestionCard question={question} key={question.id}/>)}</ul>{pages > 1 && <nav className="legacy-pagination" aria-label="Popüler soru sayfaları">{current > 1 && <Link href={`/populer?donem=${period}&sayfa=${current-1}`}>Önceki sayfa</Link>}<span>{result.totalElements} soru · Sayfa {current}</span>{current < pages && <Link href={`/populer?donem=${period}&sayfa=${current+1}`}>Sonraki sayfa</Link>}</nav>}</> : <div className="legacy-empty"><h2>Bu dönemde popüler soru yok</h2><p>Sorular görüntülendikçe burada sıralanacak.</p></div>}
  </section>;
}
