import Link from "next/link";
import { ApiError, getAllUniversities, getUniversities } from "@/lib/api/catalog";
import { catalogSegment } from "@/lib/public-url";
import {Button,ButtonLink,EmptyState} from "@/components/ui";

export const metadata = { title: "Üniversiteler", description: "Üniversiteleri gerçek öğrenci deneyimleriyle keşfet." };

type Props = { searchParams: Promise<{ q?: string | string[]; city?: string | string[]; institutionType?: string | string[]; sayfa?: string | string[] }> };

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const pageFrom = (value: string | undefined) => {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 10_001) : 1;
};

const pageHref = (page: number, query: string, city = "", institutionType = "") => {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (city) params.set("city", city);
  if (institutionType) params.set("institutionType", institutionType);
  if (page > 1) params.set("sayfa", String(page));
  const suffix = params.toString();
  return suffix ? `/universiteler?${suffix}` : "/universiteler";
};

export default async function UniversitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim().slice(0, 200);
  const city = (first(params.city) ?? "").trim().slice(0, 120);
  const institutionType = ["DEVLET","VAKIF","KKTC","YURT_DISI"].includes(first(params.institutionType) ?? "") ? first(params.institutionType)! : "";
  const currentPage = pageFrom(first(params.sayfa));

  let catalog;
  try {
    catalog = await getUniversities({ query, city, institutionType, page: currentPage - 1 });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Üniversiteler yüklenirken beklenmeyen bir hata oluştu.";
    return (
      <section className="content-section">
        <h1>Üniversiteni keşfet</h1>
        <EmptyState title="Katalog şu anda yüklenemiyor" className="university-empty-state">
          <p>{message}</p>
          <ButtonLink href={pageHref(currentPage, query, city, institutionType)}>Tekrar dene</ButtonLink>
        </EmptyState>
      </section>
    );
  }

  const totalPages = Math.ceil(catalog.totalElements / catalog.size);
  const cityCatalog = await getAllUniversities().catch(()=>[]);
  const cities = [...new Set(cityCatalog.map(item=>item.city).filter((value):value is string=>Boolean(value)))].sort((left,right)=>left.localeCompare(right,"tr"));

  return (
    <section className="content-section">
      <h1>Üniversiteni keşfet</h1>
      <p className="lead">Kampüs, eğitim, kariyer ve yaşam verilerini gerçek katkılarla incele.</p>
      <form className="university-search" action="/universiteler" role="search">
        <label className="sr-only" htmlFor="university-query">Üniversite ara</label><input id="university-query" name="q" defaultValue={query} placeholder="Üniversite ara" />
        <details open={Boolean(city||institutionType)}><summary>Filtrele</summary><div className="ui-filter-panel university-filters">
          <label>Şehir<select name="city" defaultValue={city}><option value="">Tüm şehirler</option>{cities.map(item=><option key={item}>{item}</option>)}</select></label>
          <label>Kurum türü<select name="institutionType" defaultValue={institutionType}><option value="">Tümü</option><option value="DEVLET">Devlet</option><option value="VAKIF">Vakıf</option><option value="KKTC">KKTC</option><option value="YURT_DISI">Yurt dışı</option></select></label>
          <div className="university-quick-filters"><span>Hızlı filtreler</span><div>{["İstanbul","Ankara","İzmir"].filter(item=>cities.includes(item)).map(item=><Link key={item} href={pageHref(1,query,item,institutionType)}>{item}</Link>)}<Link href={pageHref(1,query,city,"DEVLET")}>Devlet</Link><Link href={pageHref(1,query,city,"VAKIF")}>Vakıf</Link></div></div>
          <Button type="submit">Filtrele</Button><ButtonLink tone="secondary" href="/universiteler">Tümünü temizle</ButtonLink>
        </div></details><Button type="submit">Ara</Button>
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
          <ul className="catalog-grid">
            {catalog.items.map((university) => (
              <li key={university.id}>
                <h2><Link href={`/universite/${catalogSegment(university.name, university.id)}`}>{university.name}</Link></h2>
                {(university.city||university.institutionType!=="BELIRTILMEMIS")&&<p className="university-card-meta">{[university.city,university.institutionType==="DEVLET"?"Devlet":university.institutionType==="VAKIF"?"Vakıf":university.institutionType==="KKTC"?"KKTC":university.institutionType==="YURT_DISI"?"Yurt dışı":null].filter(Boolean).join(" · ")}</p>}
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <nav className="pagination" aria-label="Üniversite sayfaları">
              {currentPage > 1 && <ButtonLink tone="secondary" href={pageHref(currentPage - 1, query, city, institutionType)}>Önceki</ButtonLink>}
              <span>{currentPage} / {totalPages}</span>
              {currentPage < totalPages && <ButtonLink tone="secondary" href={pageHref(currentPage + 1, query, city, institutionType)}>Sonraki</ButtonLink>}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
