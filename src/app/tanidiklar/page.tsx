import {getTanidiklar} from "@/lib/api/profiles";
import {getAllUniversities,getUniversityDepartments} from "@/lib/api/catalog";
import {Button,ButtonLink} from "@/components/ui";
import {InfiniteResults} from "@/components/infinite-results";
import {PageTitle} from "@/components/page-title";

type Params={q?:string;sayfa?:string;universityId?:string;departmentId?:string;educationStatus?:string;classYear?:string;verified?:string;expertise?:string};
type Props={searchParams:Promise<Params>};
const expertiseOptions=["Dersler","Kariyer","Erasmus","Hazırlık","Kampüs","Yurt","Sosyal Hayat"];

export default async function FamiliarPeoplePage({searchParams}:Props){
 const params=await searchParams,query=(params.q??"").trim().slice(0,200),classYear=params.classYear?Number(params.classYear):undefined,verified=params.verified==="true"?true:undefined;
 const [universities,programs]=await Promise.all([getAllUniversities().catch(()=>[]),params.universityId?getUniversityDepartments(params.universityId).catch(()=>[]):Promise.resolve([])]);
 let result;try{result=await getTanidiklar(query,0,{universityId:params.universityId,departmentId:params.departmentId,educationStatus:params.educationStatus,classYear,verified,expertise:params.expertise,size:24});}catch{return <section className="content-section"><PageTitle help="Doğrulanmış öğrenci ve mezunları eğitim bilgilerine göre bulabilirsin.">Tanıdıklar</PageTitle><div className="empty-state"><h2>Tanıdıklar yüklenemiyor</h2><p>Daha sonra yeniden deneyebilirsin.</p></div></section>}
 const apiParams=new URLSearchParams({q:query});Object.entries({universityId:params.universityId,departmentId:params.departmentId,educationStatus:params.educationStatus,classYear,verified,expertise:params.expertise}).forEach(([key,value])=>{if(value!==undefined&&value!=="")apiParams.set(key,String(value));});
 return <section className="content-section"><PageTitle help="Üniversite, bölüm, sınıf, eğitim doğrulaması ve uzmanlık alanına göre deneyim sahibi Tanıdıklara ulaşabilirsin.">Tanıdıklar</PageTitle>
  <form className="program-filter discovery-filter" action="/tanidiklar" role="search"><label>İsim veya uzmanlık<input id="tanidik-query" name="q" defaultValue={query}/></label><label>Üniversite<select name="universityId" defaultValue={params.universityId??""}><option value="">Tümü</option>{universities.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Bölüm<select name="departmentId" defaultValue={params.departmentId??""} disabled={!params.universityId}><option value="">Tümü</option>{programs.map(item=><option value={item.departmentId} key={item.id}>{item.departmentName}</option>)}</select></label><label>Durum<select name="educationStatus" defaultValue={params.educationStatus??""}><option value="">Tümü</option><option value="UNIVERSITE_OGRENCISI">Öğrenci</option><option value="MEZUN">Mezun</option></select></label><label>Sınıf<select name="classYear" defaultValue={params.classYear??""}><option value="">Tümü</option>{[1,2,3,4,5,6].map(value=><option key={value}>{value}</option>)}</select></label><label>Uzmanlık<select name="expertise" defaultValue={params.expertise??""}><option value="">Tümü</option>{expertiseOptions.map(value=><option key={value}>{value}</option>)}</select></label><label className="checkbox-row"><input type="checkbox" name="verified" value="true" defaultChecked={verified}/> Eğitim kimliği doğrulanmış</label><Button>Filtrele</Button>{Object.values(params).some(Boolean)&&<ButtonLink tone="secondary" href="/tanidiklar">Temizle</ButtonLink>}</form>
  {result.items.length?<InfiniteResults kind="people" initial={result.items} totalElements={result.totalElements} path={`/tanidiklar?${apiParams}`}/>:<div className="empty-state"><h2>Tanıdık bulunamadı</h2><p>Filtreyi değiştirerek yeniden deneyebilir veya kendi deneyiminle Tanıdık olabilirsin.</p><ButtonLink href="/hesabim/tanidik-basvurusu">Tanıdık ol</ButtonLink></div>}
 </section>;
}
