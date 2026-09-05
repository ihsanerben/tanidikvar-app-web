import { statistics,type Statistics } from '../engagement/engagementApi'
import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
import { pageOf } from '../catalog/catalogApi'
export const scopeLabels={GENERAL:'Genel',UNIVERSITY:'Üniversite',UNIVERSITY_DEPARTMENT:'Üniversite + Bölüm'}
export type Scope=keyof typeof scopeLabels
export interface QuestionTag { id:string; name:string; available:boolean }
export interface Question { id:string; authorId:string|null; authorName:string; title:string; body:string|null; scope:Scope;
  universityId:string|null; universityName:string|null; universityDepartmentId:string|null; departmentId:string|null; departmentName:string|null;
  tags:QuestionTag[]; createdAt:string; editedAt:string|null; archivedAt:string|null; version:number; statistics:Statistics }
export interface Content { title:string; body:string; scope:Scope; universityId:string|null; universityDepartmentId:string|null; tagIds:string[] }
export function question(value:unknown):Question {
  const invalid=()=>new ApiError(200,'INVALID_RESPONSE','Soru bilgileri alınamadı.')
  if(!isRecord(value))throw invalid()
  for(const field of ['id','authorName','title','createdAt'])if(typeof value[field]!=='string')throw invalid()
  for(const field of ['authorId','body','universityId','universityName','universityDepartmentId','departmentId','departmentName','editedAt','archivedAt'])if(value[field]!==null && typeof value[field]!=='string')throw invalid()
  if(typeof value.scope!=='string'||!Object.hasOwn(scopeLabels,value.scope)||!Number.isSafeInteger(value.version)||!Array.isArray(value.tags))throw invalid()
  for(const tag of value.tags)if(!isRecord(tag)||typeof tag.id!=='string'||typeof tag.name!=='string'||typeof tag.available!=='boolean')throw invalid()
  statistics(value.statistics)
  return value as unknown as Question
}
export async function getQuestion(id:string,signal?:AbortSignal) {return question(await apiGet(`/api/questions/${encodeURIComponent(id)}`,signal))}
export async function listQuestions(path:string,signal?:AbortSignal) {return pageOf(await apiGet(path,signal),question)}
export async function createQuestion(requestId:string,content:Content) {return question(await apiMutation('/api/questions','POST',{requestId,content}))}
export async function updateQuestion(id:string,version:number,content:Content) {return question(await apiMutation(`/api/questions/${id}`,'PUT',{version,content}))}
export async function archiveQuestion(id:string,version:number) {return question(await apiMutation(`/api/questions/${id}/archive`,'POST',{version}))}
export function questionDate(value:string) {return new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(value))}
