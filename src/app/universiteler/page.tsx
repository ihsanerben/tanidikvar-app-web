import { ApiError, getAllUniversities, getUniversities } from "@/lib/api/catalog";
import {Button,ButtonLink,EmptyState} from "@/components/ui";
import {InfiniteResults} from "@/components/infinite-results";
import {PageTitle} from "@/components/page-title";

type Props = { searchParams: Promise<{ q?: string | string[]; city?: string | string[]; institutionType?: string | string[] }> };

export async function generateMetadata({searchParams}:Props) {
  const params=await searchParams,filtered=Boolean(params.q||params.city||params.institutionType);
  return {title:"Üniversiteler",description:"Üniversiteleri gerçek öğrenci deneyimleriyle keşfet.",alternates:{canonical:"/universiteler"},robots:filtered?{index:false,follow:true}:undefined};
}

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const pageHref = (query: string, city = "", institutionType = "") => {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (city) params.set("city", city);
  if (institutionType) params.set("institutionType", institutionType);
  const suffix = params.toString();
  return suffix ? `/universiteler?${suffix}` : "/universiteler";
};

export default async function UniversitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim().slice(0, 200);
  const city = (first(params.city) ?? "").trim().slice(0, 120);
  const institutionType = ["DEVLET","VAKIF","KKTC","YURT_DISI"].includes(first(params.institutionType) ?? "") ? first(params.institutionType)! : "";

  let catalog;
  try {
    catalog = await getUniversities({ query, city, institutionType, page: 0, size:24 });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Üniversiteler yüklenirken beklenmeyen bir hata oluştu.";
    return (
      <section className="content-section">
        <PageTitle help="Üniversiteleri şehir ve kurum türüne göre filtreleyerek program, soru ve Tanıdık sayılarını karşılaştırabilirsin.">Üniversiteler</PageTitle>
        <EmptyState title="Katalog şu anda yüklenemiyor" className="university-empty-state">
          <p>{message}</p>
          <ButtonLink href={pageHref(query, city, institutionType)}>Tekrar dene</ButtonLink>
        </EmptyState>
      </section>
    );
  }

  const cityCatalog = await getAllUniversities().catch(()=>[]);
  const cities = [...new Set(cityCatalog.map(item=>item.city).filter((value):value is string=>Boolean(value)))].sort((left,right)=>left.localeCompare(right,"tr"));

  return (
    <section className="content-section">
      <PageTitle help="Üniversiteleri şehir ve kurum türüne göre filtreleyebilir; her karttan program, soru ve Tanıdık sayılarını görebilirsin.">Üniversiteler</PageTitle>
      <form className="program-filter discovery-filter" action="/universiteler" role="search">
        <label>Üniversite<input id="university-query" name="q" defaultValue={query} placeholder="Üniversite ara" /></label>
          <label>Şehir<select name="city" defaultValue={city}><option value="">Tüm şehirler</option>{cities.map(item=><option key={item}>{item}</option>)}</select></label>
          <label>Kurum türü<select name="institutionType" defaultValue={institutionType}><option value="">Tümü</option><option value="DEVLET">Devlet</option><option value="VAKIF">Vakıf</option><option value="KKTC">KKTC</option><option value="YURT_DISI">Yurt dışı</option></select></label>
          <Button type="submit">Filtrele</Button><ButtonLink tone="secondary" href="/universiteler">Temizle</ButtonLink>
      </form>

      {catalog.items.length === 0 ? (
        <div className="empty-state">
          <h2>{query ? "Aramana uygun üniversite bulunamadı" : "Aktif üniversite bulunmuyor"}</h2>
          <p>{query ? "Farklı veya daha kısa bir arama deneyebilirsin." : "Katalog Manager tarafından hazırlandığında burada görünecek."}</p>
          {query && <ButtonLink tone="secondary" href="/universiteler">Tüm üniversiteler</ButtonLink>}
        </div>
      ) : (
        <>
          <p className="catalog-summary" aria-live="polite">{catalog.totalElements} üniversite</p>
          <InfiniteResults kind="universities" initial={catalog.items} totalElements={catalog.totalElements} path={`/universities?${new URLSearchParams({q:query,city,institutionType})}`} />
        </>
      )}
    </section>
  );
}
