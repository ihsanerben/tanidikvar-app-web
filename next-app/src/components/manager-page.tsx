import {redirect} from "next/navigation";
import {currentUser} from "@/lib/session";
import {ManagerConsole} from "@/components/manager-console";
import {ManagerDashboard} from "@/components/manager-dashboard";
import {ManagerAnalytics} from "@/components/manager-analytics";
type View="dashboard"|"users"|"content"|"applications"|"reports"|"actions"|"analytics"|"catalog";
const copy:Record<View,{eyebrow?:string;title:string;description?:string}>={
 dashboard:{title:"Platforma genel bakış"},
 analytics:{eyebrow:"RAPORLAMA",title:"Grafikler",description:"Platform hareketlerini İstanbul gün sınırlarıyla karşılaştır."},
 applications:{eyebrow:"MANAGER PANEL",title:"Tanıdık ve doğrulama başvuruları"},
 users:{title:"Kullanıcı yönetimi",description:"Hesapları ve Tanıdık yetkilerini geçmiş içerikleri koruyarak yönetin."},
 content:{title:"İçerik moderasyonu",description:"Soru veya yorumun bağlamını ve işlem seçeneklerini detay ekranından inceleyin."},
 reports:{title:"Şikâyetler",description:"Şikâyet edilen içeriği, sahibini ve bildirimi yapan kişiyi aynı kayıtta inceleyin."},
 catalog:{eyebrow:"MANAGER PANEL",title:"Üniversiteler ve Bölümler"},
 actions:{title:"İşlem Geçmişi"},
};
export async function ManagerPage({view}:{view:View}){const user=await currentUser();if(!user)redirect("/giris");if(user.role!=="MANAGER")redirect("/hesabim");if(view==="analytics")return <ManagerAnalytics/>;const item=copy[view];return <section className={`management-page manager-view-${view}`}>{item.eyebrow&&<p className="manager-page-eyebrow">{item.eyebrow}</p>}<h1>{item.title}</h1>{item.description&&<p>{item.description}</p>}{view==="dashboard"?<ManagerDashboard/>:<ManagerConsole view={view}/>}</section>}
