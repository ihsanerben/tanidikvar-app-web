import { apiGet,apiMutation,ApiError,isRecord } from '../../api/apiClient'
import { pageOf } from '../catalog/catalogApi'
export interface ManagedUser {id:string;email:string;name:string|null;authority:string;educationStatus:string|null;emailVerified:boolean;createdAt:string;deletedAt:string|null;version:number}
export interface ManagedContent {id:string;kind:string;questionId:string;title:string;body:string|null;authorName:string;deletedAt:string|null;moderatedAt:string|null;archivedAt:string|null;questionHidden:boolean;version:number}
export interface ManagementAction {id:string;actorId:string;action:string;targetType:string;targetId:string;reason:string|null;occurredAt:string}
export const statLabels={activeUsers:'Aktif hesap',disabledUsers:'Pasif hesap',activeAdmins:'Aktif Admin',pendingApplications:'Bekleyen başvuru',activeQuestions:'Aktif soru',archivedQuestions:'Arşivlenmiş soru',hiddenQuestions:'Gizlenmiş soru',communityAnswers:'Topluluk cevabı',adminAnswers:'Admin cevabı',likes:'Beğeni',views:'Detay görüntülenmesi'}
export type Stats=Record<keyof typeof statLabels,number>
const invalid=()=>new ApiError(200,'INVALID_RESPONSE','Yönetim bilgileri alınamadı.')
function strings(v:Record<string,unknown>,keys:string[],nullable=false){return keys.every(k=>typeof v[k]==='string'||nullable&&v[k]===null)}
export function managedUser(v:unknown):ManagedUser{if(!isRecord(v)||!strings(v,['id','email','authority','createdAt'])||!strings(v,['name','educationStatus','deletedAt'],true)||typeof v.emailVerified!=='boolean'||!Number.isSafeInteger(v.version))throw invalid();return v as unknown as ManagedUser}
export function managedContent(v:unknown):ManagedContent{if(!isRecord(v)||!strings(v,['id','kind','questionId','title','authorName'])||!strings(v,['body','deletedAt','moderatedAt','archivedAt'],true)||typeof v.questionHidden!=='boolean'||!Number.isSafeInteger(v.version))throw invalid();return v as unknown as ManagedContent}
function managementAction(v:unknown):ManagementAction{if(!isRecord(v)||!strings(v,['id','actorId','action','targetType','targetId','occurredAt'])||!strings(v,['reason'],true))throw invalid();return v as unknown as ManagementAction}
export async function getStats(signal?:AbortSignal):Promise<Stats>{const v=await apiGet('/api/manager/statistics',signal);if(!isRecord(v)||!Object.keys(statLabels).every(k=>Number.isSafeInteger(v[k])&&Number(v[k])>=0))throw invalid();return v as Stats}
export async function getActions(page:number,signal?:AbortSignal){return pageOf(await apiGet(`/api/manager/actions?page=${page}&size=10`,signal),managementAction)}
export async function getUsers(query:string,signal?:AbortSignal){return pageOf(await apiGet('/api/manager/users?'+query,signal),managedUser)}
export async function getContent(query:string,signal?:AbortSignal){return pageOf(await apiGet('/api/manager/content?'+query,signal),managedContent)}
export async function userStatus(a:ManagedUser,reason:string){return managedUser(await apiMutation(`/api/manager/users/${a.id}/status`,'PUT',{hidden:!a.deletedAt,version:a.version,reason}))}
export async function contentStatus(a:ManagedContent,reason:string){return managedContent(await apiMutation(`/api/manager/content/${a.kind}/${a.id}/status`,'PUT',{hidden:!a.moderatedAt,version:a.version,reason}))}
