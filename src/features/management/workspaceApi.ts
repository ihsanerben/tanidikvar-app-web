import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
import { pageOf, education, type Page, type Education } from '../catalog/catalogApi'
import { managedUser, managedContent, managementAction, type ManagedUser, type ManagedContent, type ManagementAction } from './managementApi'
import { parseApplication, type Application } from '../applications/applicationApi'
export interface ManagerAccount {firstName:string|null;lastName:string|null;email:string;version:number}
export interface UserDetail {user:ManagedUser;universityName:string|null;departmentName:string|null;graduationYear:number|null;verificationId:string|null;questions:number;communityAnswers:number;adminAnswers:number}
export interface Classification {scope:'GENERAL'|'UNIVERSITY'|'UNIVERSITY_DEPARTMENT';universityId:string|null;universityDepartmentId:string|null;tagIds:string[];version:number;education?:Education|null}
export interface QuestionReview {question:ManagedContent;classification:Classification;answers:Page<ManagedContent>}
export interface ActionDetail {action:ManagementAction;actorName:string}
const invalid=()=>new ApiError(200,'INVALID_RESPONSE','Yönetim bilgileri alınamadı.')
const nullable=(v:unknown)=>v===null||typeof v==='string'
function account(v:unknown):ManagerAccount {if(!isRecord(v)||!nullable(v.firstName)||!nullable(v.lastName)||typeof v.email!=='string'||!Number.isSafeInteger(v.version))throw invalid();return v as unknown as ManagerAccount}
function classification(v:unknown):Classification {if(!isRecord(v)||!['GENERAL','UNIVERSITY','UNIVERSITY_DEPARTMENT'].includes(String(v.scope))||!nullable(v.universityId)||!nullable(v.universityDepartmentId)||!Array.isArray(v.tagIds)||!v.tagIds.every(x=>typeof x==='string')||!Number.isSafeInteger(v.version))throw invalid();return {...v,education:v.education==null?null:education(v.education)} as unknown as Classification}
export async function getManagerAccount(signal?:AbortSignal){return account(await apiGet('/api/manager/account',signal))}
export async function saveManagerAccount(a:ManagerAccount){return account(await apiMutation('/api/manager/account','PUT',{firstName:a.firstName,lastName:a.lastName,version:a.version}))}
export async function getUserDetail(id:string,signal?:AbortSignal):Promise<UserDetail>{const v=await apiGet(`/api/manager/users/${id}`,signal);if(!isRecord(v)||!nullable(v.universityName)||!nullable(v.departmentName)||!nullable(v.verificationId)||!(v.graduationYear===null||Number.isSafeInteger(v.graduationYear))||!['questions','communityAnswers','adminAnswers'].every(k=>Number.isSafeInteger(v[k])))throw invalid();return {...v,user:managedUser(v.user)} as unknown as UserDetail}
export async function getApplication(id:string,signal?:AbortSignal){return parseApplication(await apiGet(`/api/manager/admin-applications/${id}`,signal))}
export async function getUserApplications(id:string,page:number,signal?:AbortSignal):Promise<Page<Application>>{return pageOf(await apiGet(`/api/manager/users/${id}/applications?page=${page}&size=10`,signal),parseApplication)}
export async function getQuestionReview(id:string,page:number,signal?:AbortSignal):Promise<QuestionReview>{const v=await apiGet(`/api/manager/questions/${id}?page=${page}&size=20`,signal);if(!isRecord(v))throw invalid();return {question:managedContent(v.question),classification:classification(v.classification),answers:pageOf(v.answers,managedContent)}}
export async function saveClassification(id:string,c:Classification,reason:string){return classification(await apiMutation(`/api/manager/questions/${id}/classification`,'PUT',{...c,reason}))}
export async function getUsage(kind:string,id:string,signal?:AbortSignal):Promise<{profiles:number;questions:number}>{const v=await apiGet(`/api/manager/catalog-usage/${kind}/${id}`,signal);if(!isRecord(v)||!Number.isSafeInteger(v.profiles)||!Number.isSafeInteger(v.questions))throw invalid();return v as {profiles:number;questions:number}}
export async function getActionDetail(id:string,signal?:AbortSignal):Promise<ActionDetail>{const v=await apiGet(`/api/manager/actions/${id}`,signal);if(!isRecord(v)||typeof v.actorName!=='string')throw invalid();return {action:managementAction(v.action),actorName:v.actorName}}
export async function findActions(query:string,signal?:AbortSignal){return pageOf(await apiGet('/api/manager/actions?'+query,signal),managementAction)}
