export type CatalogItem = {
  id: string;
  name: string;
  deletedAt: string | null;
  version: number;
  city?: string | null;
  institutionType?: "DEVLET" | "VAKIF" | "KKTC" | "YURT_DISI" | "BELIRTILMEMIS";
  description?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  accentPrimary?: string | null;
  accentSoft?: string | null;
  accentForeground?: string | null;
  programCount?: number;
  questionCount?: number;
  tanidikCount?: number;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
};

export type EducationItem = {
  id: string;
  universityId: string;
  universityName: string;
  departmentId: string;
  departmentName: string;
  deletedAt: string | null;
  available: boolean;
  version: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = () => {
  const configured = process.env.API_BASE_URL ?? "http://localhost:8080";

  try {
    return new URL(configured);
  } catch {
    throw new ApiError("API_BASE_URL geçerli bir URL değil.");
  }
};

const isCatalogItem = (value: unknown): value is CatalogItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    (typeof item.deletedAt === "string" || item.deletedAt === null) &&
    typeof item.version === "number"
  );
};

const isCatalogPage = (value: unknown): value is PageResponse<CatalogItem> => {
  if (typeof value !== "object" || value === null) return false;
  const page = value as Record<string, unknown>;
  return (
    Array.isArray(page.items) &&
    page.items.every(isCatalogItem) &&
    typeof page.page === "number" &&
    typeof page.size === "number" &&
    typeof page.totalElements === "number"
  );
};

const isEducationItem = (value: unknown): value is EducationItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.universityId === "string" &&
    typeof item.universityName === "string" &&
    typeof item.departmentId === "string" &&
    typeof item.departmentName === "string" &&
    (typeof item.deletedAt === "string" || item.deletedAt === null) &&
    typeof item.available === "boolean" &&
    typeof item.version === "number"
  );
};

async function getJson(url: URL): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError("Kataloğa şu anda ulaşılamıyor.");
  }
  if (!response.ok) throw new ApiError("Katalog kaydı yüklenemedi.", response.status);
  return response.json().catch(() => null);
}

export async function getUniversities({
  query = "",
  page = 0,
  size = 20,
  city = "",
  institutionType = "",
}: {
  query?: string;
  page?: number;
  size?: number;
  city?: string;
  institutionType?: string;
} = {}): Promise<PageResponse<CatalogItem>> {
  const url = new URL("/api/universities", apiBaseUrl());
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (city) url.searchParams.set("city", city);
  if (institutionType) url.searchParams.set("institutionType", institutionType);

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError("Üniversite kataloğuna şu anda ulaşılamıyor.");
  }

  if (!response.ok) {
    throw new ApiError("Üniversite kataloğu yüklenemedi.", response.status);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!isCatalogPage(payload)) {
    throw new ApiError("Üniversite kataloğu beklenmeyen bir yanıt döndürdü.");
  }

  return payload;
}

export async function getUniversity(id: string): Promise<CatalogItem> {
  const payload = await getJson(new URL(`/api/universities/${id}`, apiBaseUrl()));
  if (!isCatalogItem(payload)) throw new ApiError("Üniversite beklenmeyen bir yanıt döndürdü.");
  return payload;
}

export async function getAllUniversities(): Promise<CatalogItem[]> {
  const firstPage = await getUniversities({ size: 100 });
  const items = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.totalElements / firstPage.size);
  for (let page = 1; page < totalPages; page += 1) {
    items.push(...(await getUniversities({ page, size: 100 })).items);
  }
  return items.toSorted((a, b) => a.name.localeCompare(b.name, "tr", { sensitivity: "base" }));
}

async function getUniversityDepartmentPage(id: string, pageNumber: number): Promise<PageResponse<EducationItem>> {
  const url = new URL(`/api/universities/${id}/departments`, apiBaseUrl());
  url.searchParams.set("page", String(pageNumber));
  url.searchParams.set("size", "100");
  const payload = await getJson(url);
  if (typeof payload !== "object" || payload === null) throw new ApiError("Programlar beklenmeyen bir yanıt döndürdü.");
  const page = payload as Record<string, unknown>;
  if (
    !Array.isArray(page.items) ||
    !page.items.every(isEducationItem) ||
    typeof page.page !== "number" ||
    typeof page.size !== "number" ||
    typeof page.totalElements !== "number"
  ) {
    throw new ApiError("Programlar beklenmeyen bir yanıt döndürdü.");
  }
  return page as PageResponse<EducationItem>;
}

export async function getUniversityDepartments(id: string): Promise<EducationItem[]> {
  const firstPage = await getUniversityDepartmentPage(id, 0);
  const items = [...firstPage.items];
  const totalPages = Math.ceil(firstPage.totalElements / firstPage.size);

  for (let page = 1; page < totalPages; page += 1) {
    items.push(...(await getUniversityDepartmentPage(id, page)).items);
  }

  return items.toSorted((a, b) => a.departmentName.localeCompare(b.departmentName, "tr", { sensitivity: "base" }));
}

export async function getEducation(universityId: string, departmentId: string): Promise<EducationItem> {
  const payload = await getJson(new URL(`/api/universities/${universityId}/departments/${departmentId}`, apiBaseUrl()));
  if (!isEducationItem(payload)) throw new ApiError("Program beklenmeyen bir yanıt döndürdü.");
  return payload;
}

export type LabelCount = { label: string; count: number };
export type YearCatalogStatistics = { year: number; programCount: number; quota: number; placed: number; fillRate: number | null; preferences: number };
export type AdmissionStatistics = { year:number; quota:number|null; placed:number|null; minimumScore:number|null; maximumScore:number|null; successRank:number|null; placedMale:number|null; placedFemale:number|null; averageSecondaryScore:number|null; totalPreferences:number|null; demandPerQuota:number|null; averagePreferenceRank:number|null };
export type AdmissionOption = { id:string; programCode:string; faculty:string|null; scoreType:string|null; durationYears:number|null; statistics:AdmissionStatistics[] };
export type ProgramSummary = { id:string; educationId:string|null; departmentId:string|null; universityId:string; universityName:string; city:string|null; institutionType:string; name:string; degreeLevel:string; programCodes:string[]; faculties:string[]; scoreTypes:string[]; durationYears:number|null; optionCount:number; currentBestRank:number|null; currentMinimumScore:number|null; currentQuota:number; currentPlaced:number };
export type ProgramDetail = { summary:ProgramSummary; options:AdmissionOption[] };
export type CatalogOverview = { universityCount:number; programCount:number; optionCount:number; statisticsCount:number; rankedOptionCount:number; institutionTypes:LabelCount[]; cities:LabelCount[]; degreeLevels:LabelCount[]; scoreTypes:LabelCount[]; yearly:YearCatalogStatistics[]; lastSynchronizedAt:string|null };
export type UniversityCatalogStatistics = { universityId:string; facultyCount:number; programCount:number; optionCount:number; academicUnits:LabelCount[]; degreeLevels:LabelCount[]; scoreTypes:LabelCount[]; yearly:YearCatalogStatistics[]; bestRankedPrograms:ProgramSummary[] };

export type ProgramFilters = { query?:string; programName?:string; universityName?:string; universityId?:string; city?:string; institutionType?:string; degreeLevel?:string; scoreType?:string; durationYears?:number; rankFrom?:number; rankTo?:number; scoreFrom?:number; scoreTo?:number; filled?:boolean; year?:number; faculty?:string; sort?:"NAME"|"RANK"|"SCORE"|"QUOTA"; page?:number; size?:number };

export async function getCatalogPrograms(filters:ProgramFilters={}):Promise<PageResponse<ProgramSummary>> {
  const url=new URL("/api/catalog-programs",apiBaseUrl());
  const entries:Record<string,string|number|boolean|undefined>={q:filters.query,programName:filters.programName,universityName:filters.universityName,universityId:filters.universityId,city:filters.city,institutionType:filters.institutionType,degreeLevel:filters.degreeLevel,scoreType:filters.scoreType,durationYears:filters.durationYears,rankFrom:filters.rankFrom,rankTo:filters.rankTo,scoreFrom:filters.scoreFrom,scoreTo:filters.scoreTo,filled:filters.filled,year:filters.year,faculty:filters.faculty,sort:filters.sort,page:filters.page??0,size:filters.size??24};
  Object.entries(entries).forEach(([key,value])=>{if(value!==undefined&&value!=="")url.searchParams.set(key,String(value));});
  return await getJson(url) as PageResponse<ProgramSummary>;
}
export async function getAllCatalogPrograms(filters:Omit<ProgramFilters,"page"|"size">={}):Promise<ProgramSummary[]> {
  const firstPage=await getCatalogPrograms({...filters,page:0,size:100});
  const items=[...firstPage.items];
  const totalPages=Math.ceil(firstPage.totalElements/firstPage.size);
  for(let page=1;page<totalPages;page+=1)items.push(...(await getCatalogPrograms({...filters,page,size:100})).items);
  return items.toSorted((a,b)=>a.name.localeCompare(b.name,"tr",{sensitivity:"base"}));
}
export async function getCatalogProgram(id:string):Promise<ProgramDetail>{return await getJson(new URL(`/api/catalog-programs/${id}`,apiBaseUrl())) as ProgramDetail;}
export async function getCatalogOverview():Promise<CatalogOverview>{return await getJson(new URL("/api/statistics/overview",apiBaseUrl())) as CatalogOverview;}
export async function getUniversityCatalogStatistics(id:string):Promise<UniversityCatalogStatistics>{return await getJson(new URL(`/api/universities/${id}/catalog-statistics`,apiBaseUrl())) as UniversityCatalogStatistics;}
