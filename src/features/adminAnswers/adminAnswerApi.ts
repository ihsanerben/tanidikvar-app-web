import { apiGet,apiMutation,ApiError,isRecord } from '../../api/apiClient'
import { pageOf } from '../catalog/catalogApi'
export interface AdminAnswer {id:string;questionId:string;questionTitle:string;authorId:string|null;authorName:string;activeAdmin:boolean;universityName:string|null;departmentName:string|null;educationStatus:string|null;graduationYear:number|null;avatarFileId:string|null;occupation:string|null;company:string|null;body:string;publishedAt:string;editedAt:string|null;deletedAt:string|null;version:number}
export interface Assignment {questionId:string;questionTitle:string;assigned:boolean;version:number;assignedAt:string|null;archivedAt:string|null}
export interface Quota {activeAdmin:boolean;day:string;used:number;limit:number;remaining:number;resetsAt:string}
export interface OwnAdminAnswer {answer:AdminAnswer|null;assignment:Assignment}
export interface AdminProfile {id:string;name:string;activeAdmin:boolean;universityName:string;departmentName:string;educationStatus:string;graduationYear:number|null;biography:string|null;occupation:string|null;company:string|null;avatarFileId:string|null;answerCount:number}
const invalid=()=>new ApiError(200,'INVALID_RESPONSE','Admin bilgileri alınamadı.')
export function adminAnswer(v:unknown):AdminAnswer {
 if(!isRecord(v)||!['id','questionId','questionTitle','authorName','body','publishedAt'].every(k=>typeof v[k]==='string')||!['authorId','universityName','departmentName','educationStatus','avatarFileId','occupation','company','editedAt','deletedAt'].every(k=>v[k]===null||typeof v[k]==='string')||typeof v.activeAdmin!=='boolean'||!Number.isSafeInteger(v.version)||!(v.graduationYear===null||Number.isInteger(v.graduationYear)))throw invalid()
 return v as unknown as AdminAnswer
}
export function assignment(v:unknown):Assignment{if(!isRecord(v)||typeof v.questionId!=='string'||typeof v.questionTitle!=='string'||typeof v.assigned!=='boolean'||!Number.isSafeInteger(v.version)||!['assignedAt','archivedAt'].every(k=>v[k]===null||typeof v[k]==='string'))throw invalid();return v as unknown as Assignment}
export async function getOwn(q:string,signal?:AbortSignal):Promise<OwnAdminAnswer>{const v=await apiGet(`/api/questions/${q}/my-admin-answer`,signal);if(!isRecord(v))throw invalid();return {answer:v.answer===null?null:adminAnswer(v.answer),assignment:assignment(v.assignment)}}
export async function getQuota(signal?:AbortSignal):Promise<Quota>{const v=await apiGet('/api/me/admin-quota',signal);if(!isRecord(v)||typeof v.activeAdmin!=='boolean'||typeof v.day!=='string'||typeof v.resetsAt!=='string'||!['used','limit','remaining'].every(k=>Number.isSafeInteger(v[k])&&Number(v[k])>=0))throw invalid();return v as unknown as Quota}
export async function assign(a:Assignment,assigned:boolean){return assignment(await apiMutation(`/api/questions/${a.questionId}/assignment`,'PUT',{assigned,version:a.version}))}
export async function save(q:string,body:string,a?:AdminAnswer){return adminAnswer(await apiMutation(a?`/api/admin-answers/${a.id}`:`/api/questions/${q}/admin-answers`,a?'PUT':'POST',a?{body,version:a.version}:{body}))}
export async function setStatus(a:AdminAnswer,deleted:boolean){return adminAnswer(await apiMutation(`/api/admin-answers/${a.id}/status`,'PUT',{deleted,version:a.version}))}
export async function listAnswers(path:string,signal?:AbortSignal){return pageOf(await apiGet(path,signal),adminAnswer)}
export async function listAssignments(page:number,signal?:AbortSignal){return pageOf(await apiGet(`/api/me/assignments?page=${page}&size=10`,signal),assignment)}
export async function getAdmin(id:string,signal?:AbortSignal):Promise<AdminProfile>{
 const v=await apiGet(`/api/admins/${encodeURIComponent(id)}`,signal)
 if(!isRecord(v)||!['id','name','universityName','departmentName','educationStatus'].every(k=>typeof v[k]==='string')||typeof v.activeAdmin!=='boolean'||!Number.isSafeInteger(v.answerCount)||!['biography','occupation','company','avatarFileId'].every(k=>v[k]===null||typeof v[k]==='string')||!(v.graduationYear===null||Number.isInteger(v.graduationYear)))throw invalid()
 return v as unknown as AdminProfile
}
export function avatarUrl(id:string){return (import.meta.env.VITE_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'')+'/api/avatars/'+encodeURIComponent(id)}

