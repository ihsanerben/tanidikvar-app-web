import Link from "next/link";
import {redirect} from "next/navigation";
import {authenticatedApi,currentUser} from "@/lib/session";
import type {QuestionPage} from "@/lib/api/questions";
import {InfiniteResults} from "@/components/infinite-results";
import {PersonalQuestionFilter,questionFilterQuery,type PersonalQuestionFilters} from "@/components/personal-question-filter";
import {PageTitle} from "@/components/page-title";

export const metadata={title:"Sorularım",robots:{index:false,follow:false}};
export default async function MyQuestionsPage({searchParams}:{searchParams:Promise<PersonalQuestionFilters>}){
 if(!await currentUser())redirect("/giris");
 const params=await searchParams,archived=params.durum==="arsiv",filters=questionFilterQuery(params);
 const [activePage,archivedPage]=await Promise.all([authenticatedApi<QuestionPage>(`/me/questions?status=ACTIVE&size=24&${filters}`),authenticatedApi<QuestionPage>(`/me/questions?status=ARCHIVED&size=24&${filters}`)]),page=archived?archivedPage:activePage;
 const path=`/me/questions?status=${archived?'ARCHIVED':'ACTIVE'}&${filters}`;
 const href=(status:string)=>{const query=new URLSearchParams(Object.entries(params).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));query.set('durum',status);return `/hesabim/sorularim?${query}`;};
 return <section className="legacy-account-page my-questions-page"><Link href="/hesabim">← Hesabıma dön</Link><PageTitle help="Yayınladığın aktif ve arşivlenmiş soruları burada görebilir, düzenleme ve arşivleme işlemlerini soru detayından yapabilirsin.">Sorularım</PageTitle><nav className="account-content-tabs" aria-label="Soru durumu"><Link aria-current={!archived?"page":undefined} className={!archived?"active":""} href={href("aktif")}>Aktif sorular ({activePage?.totalElements??0})</Link><Link aria-current={archived?"page":undefined} className={archived?"active":""} href={href("arsiv")}>Arşivlenmiş sorular ({archivedPage?.totalElements??0})</Link></nav>
 <PersonalQuestionFilter path="/hesabim/sorularim" params={params} hidden={{durum:archived?"arsiv":"aktif"}}/>
 {!page?<p role="alert">Soruların yüklenemedi. Tekrar dene.</p>:page.items.length?<InfiniteResults kind="questions" initial={page.items} totalElements={page.totalElements} path={path}/>:<div className="legacy-empty"><h2>{archived?"Arşivlenmiş sorun yok":"Henüz soru sormadın"}</h2><Link className="button" href="/soru-sor">Soru sor</Link></div>}
 </section>;
}
