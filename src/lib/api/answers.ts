import { QuestionApiError } from "./questions";

export type AnswerItem = {
  id: string; questionId: string; questionTitle?: string; authorId: string | null; authorName: string; activeAdmin: boolean; educationVerified?: boolean;
  universityName: string | null; departmentName: string | null; educationStatus: string | null; body: string;
  publishedAt: string; editedAt: string | null; likeCount: number; version:number; anonymous?:boolean; answerType?: "COMMUNITY" | "TANIDIK";
};
export type AnswerPage = { items: AnswerItem[]; page: number; size: number; totalElements: number };
export type AnswerComment={id:string;answerId:string;authorId:string;authorName:string;body:string;createdAt:string;version:number};

const base = () => new URL(process.env.API_BASE_URL ?? "http://localhost:8080");
const nullableString = (value: unknown) => typeof value === "string" || value === null;
const valid = (value: unknown): value is AnswerItem => {
  if (typeof value !== "object" || value === null) return false;
  const answer = value as Record<string, unknown>;
  return typeof answer.id === "string" && typeof answer.questionId === "string" && nullableString(answer.authorId) &&
    typeof answer.authorName === "string" && typeof answer.activeAdmin === "boolean" && (answer.educationVerified===undefined||typeof answer.educationVerified==="boolean") && nullableString(answer.universityName) &&
    nullableString(answer.departmentName) && nullableString(answer.educationStatus) && typeof answer.body === "string" &&
    typeof answer.publishedAt === "string" && nullableString(answer.editedAt) && typeof answer.likeCount === "number" && typeof answer.version === "number";
};
async function page(url: URL): Promise<AnswerPage> {
  let response: Response;
  try { response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } }); }
  catch { throw new QuestionApiError("Yanıtlara şu anda ulaşılamıyor."); }
  if (!response.ok) throw new QuestionApiError("Yanıtlar yüklenemedi.", response.status);
  const payload: unknown = await response.json().catch(() => null);
  if (typeof payload !== "object" || payload === null) throw new QuestionApiError("Yanıtlar beklenmeyen bir yanıt döndürdü.");
  const result = payload as Record<string, unknown>;
  if (!Array.isArray(result.items) || !result.items.every(valid) || typeof result.page !== "number" || typeof result.size !== "number" || typeof result.totalElements !== "number") throw new QuestionApiError("Yanıtlar beklenmeyen bir yanıt döndürdü.");
  return result as AnswerPage;
}
async function all(path: string): Promise<AnswerItem[]> {
  const url = new URL(path, base()); url.searchParams.set("size", "100");
  const first = await page(url); const items = [...first.items];
  for (let current = 1; current < Math.ceil(first.totalElements / first.size); current += 1) { url.searchParams.set("page", String(current)); items.push(...(await page(url)).items); }
  return items;
}
export async function getQuestionAnswers(id: string) {
  const [community, tanidik] = await Promise.all([all(`/api/questions/${id}/answers`), all(`/api/questions/${id}/admin-answers`)]);
  return [...community.map(item=>({...item,answerType:"COMMUNITY" as const})), ...tanidik.map(item=>({...item,answerType:"TANIDIK" as const}))].sort((left, right) => Date.parse(left.publishedAt) - Date.parse(right.publishedAt));
}
export async function getProfileAnswers(id: string) {
  const [community, tanidik] = await Promise.all([all(`/api/profiles/${id}/comments/community`), all(`/api/profiles/${id}/comments/admin`)]);
  return [...community.map(item => ({...item, answerType: "COMMUNITY" as const})), ...tanidik.map(item => ({...item, answerType: "TANIDIK" as const}))].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}
export async function getProfileAnswerHistory(id: string, type: "COMMUNITY" | "TANIDIK") {
  return all(`/api/profiles/${id}/comments/${type === "TANIDIK" ? "admin" : "community"}`);
}
export async function getAnswerComments(id:string):Promise<AnswerComment[]>{
  const response=await fetch(new URL(`/api/answers/${id}/comments?size=100`,base()),{cache:"no-store",headers:{Accept:"application/json"}});
  if(!response.ok)return [];
  const payload=await response.json().catch(()=>null) as {items?:AnswerComment[]}|null;
  return Array.isArray(payload?.items)?payload.items:[];
}
