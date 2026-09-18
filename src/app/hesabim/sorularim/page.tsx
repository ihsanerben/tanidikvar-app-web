import Link from "next/link";
import {redirect} from "next/navigation";
import {authenticatedApi,currentUser} from "@/lib/session";
import type {QuestionPage} from "@/lib/api/questions";
import {QuestionCard} from "@/components/question-card";
import {PageTitle} from "@/components/page-title";

export const metadata={title:"Sorularım",robots:{index:false,follow:false}};
export default async function MyQuestionsPage({searchParams}:{searchParams:Promise<{durum?:string}>}){
 if(!await currentUser())redirect("/giris");
 const archived=(await searchParams).durum==="arsiv";
 const [activePage,archivedPage]=await Promise.all([authenticatedApi<QuestionPage>("/me/questions?status=ACTIVE&size=100"),authenticatedApi<QuestionPage>("/me/questions?status=ARCHIVED&size=100")]),page=archived?archivedPage:activePage;
 return <section className="legacy-account-page my-questions-page"><Link href="/hesabim">← Hesabıma dön</Link><PageTitle help="Yayınladığın aktif ve arşivlenmiş soruları burada görebilir, düzenleme ve arşivleme işlemlerini soru detayından yapabilirsin.">Sorularım</PageTitle><nav className="account-content-tabs" aria-label="Soru durumu"><Link aria-current={!archived?"page":undefined} className={!archived?"active":""} href="/hesabim/sorularim">Aktif sorular ({activePage?.totalElements??0})</Link><Link aria-current={archived?"page":undefined} className={archived?"active":""} href="/hesabim/sorularim?durum=arsiv">Arşivlenmiş sorular ({archivedPage?.totalElements??0})</Link></nav>
 {page?.items.length?<ul className="legacy-question-list">{page.items.map(question=><QuestionCard key={question.id} question={question}/>)}</ul>:<div className="legacy-empty"><h2>{archived?"Arşivlenmiş sorun yok":"Henüz soru sormadın"}</h2><Link className="button" href="/soru-sor">Soru sor</Link></div>}
 </section>;
}
