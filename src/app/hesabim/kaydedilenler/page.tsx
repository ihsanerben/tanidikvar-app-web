import Link from "next/link";
import {redirect} from "next/navigation";
import {authenticatedApi,currentUser} from "@/lib/session";
import {PageTitle} from "@/components/page-title";
import {PersonalQuestionFilter,questionFilterQuery,type PersonalQuestionFilters} from "@/components/personal-question-filter";
import {InfiniteResults} from "@/components/infinite-results";
import type {QuestionPage} from "@/lib/api/questions";
export const metadata={title:"Kaydedilenler",robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<PersonalQuestionFilters>}){
 if(!await currentUser())redirect('/giris');
 const params=await searchParams,query=questionFilterQuery(params),path=`/me/saved/questions?${query}`;
 const page=await authenticatedApi<QuestionPage>(`${path}&size=24`);
 return <section className="legacy-account-page"><Link href="/hesabim">← Hesabıma dön</Link><PageTitle help="Kaydettiğin tüm soruları arayabilir, kapsam ve cevap durumuna göre filtreleyebilirsin.">Kaydedilenler</PageTitle>
 <PersonalQuestionFilter path="/hesabim/kaydedilenler" params={params}/>
 {!page?<p role="alert">Kaydedilen sorular yüklenemedi. Sayfayı yenileyerek tekrar dene.</p>:page.items.length?<InfiniteResults kind="questions" initial={page.items} totalElements={page.totalElements} path={path}/>:<div className="legacy-empty"><h2>Bu filtrelerle kayıtlı soru bulunamadı</h2><Link href="/sorular">Soruları keşfet</Link></div>}</section>;
}
