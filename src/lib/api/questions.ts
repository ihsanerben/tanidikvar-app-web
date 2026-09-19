export type QuestionScope = "GENERAL" | "UNIVERSITY" | "UNIVERSITY_DEPARTMENT";
export type QuestionTag = { id: string; name: string; available: boolean };
export type QuestionStatistics = { viewCount: number; likeCount: number; communityAnswerCount: number; adminAnswerCount: number; totalAnswerCount: number };
export type QuestionItem = {
  id: string; authorId: string | null; authorName: string; avatarFileId: string | null; educationStatus: string | null; activeAdmin: boolean;
  title: string; body: string | null; scope: QuestionScope; universityId: string | null; universityName: string | null;
  programId: string | null; departmentId: string | null; departmentName: string | null; tags: QuestionTag[]; createdAt: string; editedAt: string | null;
  archivedAt: string | null; version: number; bestAnswerId: string | null; statistics: QuestionStatistics;
};
export type QuestionPage = { items: QuestionItem[]; page: number; size: number; totalElements: number };

export class QuestionApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message); this.name = "QuestionApiError"; }
}

const apiBaseUrl = () => {
  try { return new URL(process.env.API_BASE_URL ?? "http://localhost:8080"); }
  catch { throw new QuestionApiError("API_BASE_URL geçerli bir URL değil."); }
};
const nullableString = (value: unknown) => typeof value === "string" || value === null;
const finiteNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);
const isQuestionTag = (value: unknown): value is QuestionTag => {
  if (typeof value !== "object" || value === null) return false;
  const tag = value as Record<string, unknown>;
  return typeof tag.id === "string" && typeof tag.name === "string" && typeof tag.available === "boolean";
};
const isStatistics = (value: unknown): value is QuestionStatistics => {
  if (typeof value !== "object" || value === null) return false;
  const statistics = value as Record<string, unknown>;
  return finiteNumber(statistics.viewCount) && finiteNumber(statistics.likeCount) && finiteNumber(statistics.communityAnswerCount) && finiteNumber(statistics.adminAnswerCount) && finiteNumber(statistics.totalAnswerCount);
};
const isQuestion = (value: unknown): value is QuestionItem => {
  if (typeof value !== "object" || value === null) return false;
  const question = value as Record<string, unknown>;
  return typeof question.id === "string" && nullableString(question.authorId) && typeof question.authorName === "string" && nullableString(question.avatarFileId) && nullableString(question.educationStatus) && typeof question.activeAdmin === "boolean" && typeof question.title === "string" && nullableString(question.body) && ["GENERAL", "UNIVERSITY", "UNIVERSITY_DEPARTMENT"].includes(String(question.scope)) && nullableString(question.universityId) && nullableString(question.universityName) && (question.programId === undefined || nullableString(question.programId)) && nullableString(question.departmentId) && nullableString(question.departmentName) && Array.isArray(question.tags) && question.tags.every(isQuestionTag) && typeof question.createdAt === "string" && nullableString(question.editedAt) && nullableString(question.archivedAt) && finiteNumber(question.version) && nullableString(question.bestAnswerId) && isStatistics(question.statistics);
};
const normalizeQuestion = (value: unknown): QuestionItem | null => {
  if (!isQuestion(value)) return null;
  return { ...value, programId: value.programId ?? null, departmentName: plainProgramName(value.departmentName) || null };
};
const parseQuestionPage = (payload: unknown, message: string): QuestionPage => {
  if (typeof payload !== "object" || payload === null) throw new QuestionApiError(message);
  const result = payload as Record<string, unknown>;
  if (!Array.isArray(result.items) || !finiteNumber(result.page) || !finiteNumber(result.size) || !finiteNumber(result.totalElements)) throw new QuestionApiError(message);
  const items = result.items.map(normalizeQuestion);
  if (items.some(item => item === null)) throw new QuestionApiError(message);
  return { items: items as QuestionItem[], page: result.page as number, size: result.size as number, totalElements: result.totalElements as number };
};
async function fetchJson(url: URL): Promise<unknown> {
  let response: Response;
  try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } }); }
  catch { throw new QuestionApiError("Sorulara şu anda ulaşılamıyor."); }
  if (!response.ok) throw new QuestionApiError("Soru verisi yüklenemedi.", response.status);
  return response.json().catch(() => null);
}
export async function getQuestions(query: string, page: number, filters: {scope?:QuestionScope;universityId?:string;departmentId?:string;tagId?:string;city?:string;answered?:boolean;verifiedAnswer?:boolean;sort?:string;size?:number} = {}): Promise<QuestionPage> {
  const url = new URL("/api/questions", apiBaseUrl());
  url.searchParams.set("q", query); url.searchParams.set("page", String(page)); url.searchParams.set("size", String(filters.size??20));
  Object.entries(filters).forEach(([key,value])=>{if(key!=="size"&&value!==undefined&&value!=="")url.searchParams.set(key,String(value));});
  return parseQuestionPage(await fetchJson(url), "Sorular beklenmeyen bir yanıt döndürdü.");
}
export async function getPopularQuestions(period: "DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"|"ALL_TIME", page: number, size=20): Promise<QuestionPage> {
  if (period === "ALL_TIME") return getQuestions("", page, {sort:"MOST_VIEWED",size});
  const url = new URL("/api/popular", apiBaseUrl());
  url.searchParams.set("period", period); url.searchParams.set("page", String(page)); url.searchParams.set("size", String(size));
  return parseQuestionPage(await fetchJson(url), "Popüler sorular beklenmeyen bir yanıt döndürdü.");
}
export async function getQuestion(id: string): Promise<QuestionItem> {
  const question = normalizeQuestion(await fetchJson(new URL(`/api/questions/${id}`, apiBaseUrl())));
  if (!question) throw new QuestionApiError("Soru beklenmeyen bir yanıt döndürdü.");
  return question;
}
import {plainProgramName} from "@/lib/program-label";
