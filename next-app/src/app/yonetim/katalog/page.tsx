import {CatalogPage} from "@/manager-legacy/pages";
import {UniversityDetailsManager} from "@/components/university-details-manager";
import {MetricCards} from "@/components/catalog-statistics";
import {getCatalogOverview} from "@/lib/api/catalog";
export const metadata={title:"Üniversiteler ve Bölümler",robots:{index:false,follow:false}};
export default async function Page(){const stats=await getCatalogOverview().catch(()=>null);return <>{stats&&<section className="manager-extension"><h2>Aktarılan veri özeti</h2><MetricCards items={[{label:"Üniversite",value:stats.universityCount},{label:"Program",value:stats.programCount},{label:"Yerleştirme seçeneği",value:stats.optionCount},{label:"İstatistik satırı",value:stats.statisticsCount}]}/><p className="muted">{stats.lastSynchronizedAt?`Son başarılı aktarım: ${new Date(stats.lastSynchronizedAt).toLocaleString("tr-TR")}`:"Henüz başarılı aktarım yok."}</p></section>}<CatalogPage /><div className="manager-extension"><UniversityDetailsManager/></div></>;}
