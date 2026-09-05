import { apiGet,apiMutation,ApiError,isRecord } from '../../api/apiClient'
import { pageOf } from '../catalog/catalogApi'
export interface Answer { id:string;questionId:string;authorId:string|null;authorName:string;answerKind:'COMMUNITY';body:string;publishedAt:string;editedAt:string|null;deletedAt:string|null;version:number }
export function answer(value:unknown):Answer {
  const invalid=()=>new ApiError(200,'INVALID_RESPONSE','Cevap bilgileri alınamadı.')
  if(!isRecord(value))throw invalid()
  for(const field of ['id','questionId','authorName','body','publishedAt'])if(typeof value[field]!=='string')throw invalid()
  for(const field of ['authorId','editedAt','deletedAt'])if(value[field]!==null && typeof value[field]!=='string')throw invalid()
  if(value.answerKind!=='COMMUNITY'||!Number.isSafeInteger(value.version)||Number(value.version)<0)throw invalid()
  return value as unknown as Answer
}
export async function listAnswers(questionId:string,page:number,signal?:AbortSignal) {return pageOf(await apiGet(`/api/questions/${questionId}/answers?page=${page}&size=20`,signal),answer)}
export async function myAnswer(questionId:string,signal?:AbortSignal) {const result=await apiGet(`/api/questions/${questionId}/my-answer`,signal);return result===undefined?null:answer(result)}
export async function createAnswer(questionId:string,body:string) {return answer(await apiMutation(`/api/questions/${questionId}/answers`,'POST',{body}))}
export async function updateAnswer(a:Answer,body:string) {return answer(await apiMutation(`/api/answers/${a.id}`,'PUT',{body,version:a.version}))}
export async function setAnswerStatus(a:Answer,deleted:boolean) {return answer(await apiMutation(`/api/answers/${a.id}/status`,'PUT',{deleted,version:a.version}))}
