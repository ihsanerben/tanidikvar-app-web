import {getCatalogPrograms,type ProgramFilters} from "@/lib/api/catalog";
import {InfiniteResults} from "@/components/infinite-results";
import {PageTitle} from "@/components/page-title";
import {Button,ButtonLink} from "@/components/ui";

export const metadata={title:"Programları keşfet",description:"Üniversite programlarını şehir, puan türü ve başarı sırasına göre filtrele.",alternates:{canonical:"/programlar"}};
const one=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;

export default async function ProgramsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 const filters:ProgramFilters={query:(one(params.q)??"").trim().slice(0,100),programName:(one(params.programName)??"").trim().slice(0,100),universityName:(one(params.universityName)??"").trim().slice(0,100),city:(one(params.city)??"").slice(0,100),institutionType:one(params.tur)??"",degreeLevel:one(params.duzey)??"",scoreType:one(params.puan)??"",rankFrom:one(params.siraMin)?Number(one(params.siraMin)):undefined,rankTo:one(params.siraMax)?Number(one(params.siraMax)):undefined,scoreFrom:one(params.puanMin)?Number(one(params.puanMin)):undefined,scoreTo:one(params.puanMax)?Number(one(params.puanMax)):undefined,year:Number(one(params.yil)??2026),sort:"RANK",page:0,size:24};
 const data=await getCatalogPrograms(filters),apiParams=new URLSearchParams();Object.entries(filters).forEach(([key,value])=>{if(value!==undefined&&value!=="")apiParams.set(key==="query"?"q":key,String(value));});
 return <main className="content-section programs-page"><PageTitle help="Programları ad, üniversite, şehir, kurum, düzey ve puan türüne göre filtreleyebilirsin. Ayrıntılı başarı sırası ve puan aralıkları üç nokta altında bulunur.">Programlar</PageTitle>
  <form className="program-filter discovery-filter" action="/programlar" role="search">
   <label className="program-name-field">Program adı<input name="programName" defaultValue={filters.programName} placeholder="Örn. Bilgisayar Mühendisliği"/></label>
   <label>Üniversite adı<input name="universityName" defaultValue={filters.universityName} placeholder="Üniversite ara"/></label>
   <label>Şehir<input name="city" defaultValue={filters.city}/></label>
   <label>Kurum<select name="tur" defaultValue={filters.institutionType}><option value="">Tümü</option><option value="DEVLET">Devlet</option><option value="VAKIF">Vakıf</option><option value="KKTC">KKTC</option><option value="YURT_DISI">Yurt dışı</option></select></label>
   <label>Düzey<select name="duzey" defaultValue={filters.degreeLevel}><option value="">Tümü</option><option value="LISANS">Lisans</option><option value="ONLISANS">Ön lisans</option></select></label>
   <label>Puan türü<select name="puan" defaultValue={filters.scoreType}><option value="">Tümü</option>{["TYT","SAY","EA","SÖZ","DİL"].map(value=><option key={value}>{value}</option>)}</select></label>
   <label>Yıl<select name="yil" defaultValue={filters.year}>{Array.from({length:12},(_,index)=>2026-index).map(value=><option key={value}>{value}</option>)}</select></label>
   <div className="filter-actions"><details className="advanced-filter" data-close-on-outside><summary aria-label="Ayrıntılı filtreleri göster">…</summary><div><label>Başarı sırası (en az)<input name="siraMin" type="number" min="1" defaultValue={filters.rankFrom}/></label><label>Başarı sırası (en çok)<input name="siraMax" type="number" min="1" defaultValue={filters.rankTo}/></label><label>Taban puan (en az)<input name="puanMin" type="number" min="0" step="0.001" defaultValue={filters.scoreFrom}/></label><label>Taban puan (en çok)<input name="puanMax" type="number" min="0" step="0.001" defaultValue={filters.scoreTo}/></label></div></details><Button type="submit">Filtrele</Button><ButtonLink tone="secondary" href="/programlar">Temizle</ButtonLink></div>
  </form>
  <p className="catalog-summary">{data.totalElements.toLocaleString("tr-TR")} program · {filters.year} verisi</p><InfiniteResults kind="programs" initial={data.items} totalElements={data.totalElements} path={`/catalog-programs?${apiParams}`}/>
 </main>;
}
