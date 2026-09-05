import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
import { education, type Education } from '../catalog/catalogApi'
export type EducationStatus='YKS_ADAYI'|'UNIVERSITE_OGRENCISI'|'MEZUN'
export const statusLabels: Record<EducationStatus,string>={YKS_ADAYI:'YKS Adayı',UNIVERSITE_OGRENCISI:'Üniversite Öğrencisi',MEZUN:'Mezun'}
export interface Profile {firstName:string|null;lastName:string|null;educationStatus:EducationStatus|null;education:Education|null;
  graduationYear:number|null;biography:string|null;occupation:string|null;company:string|null;completed:boolean;version:number}
export interface ProfileInput {firstName:string;lastName:string;educationStatus:EducationStatus;universityDepartmentId:string|null;
  graduationYear:number|null;biography:string;occupation:string;company:string;version:number}
function parse(value:unknown):Profile {
  if(!isRecord(value) || typeof value.completed!=='boolean' || typeof value.version!=='number'
    || !(value.educationStatus===null || (typeof value.educationStatus==='string' && value.educationStatus in statusLabels))
    || !['firstName','lastName','biography','occupation','company'].every(key=>value[key]===null || typeof value[key]==='string')
    || !(value.graduationYear===null || typeof value.graduationYear==='number')) throw new ApiError(200,'INVALID_RESPONSE','Profil bilgileri alınamadı.')
  return {firstName:value.firstName as string|null,lastName:value.lastName as string|null,educationStatus:value.educationStatus as EducationStatus|null,
    education:value.education===null?null:education(value.education),graduationYear:value.graduationYear as number|null,
    biography:value.biography as string|null,occupation:value.occupation as string|null,company:value.company as string|null,completed:value.completed,version:value.version}
}
export async function getProfile(signal?:AbortSignal){return parse(await apiGet('/api/me/profile',signal))}
export async function saveProfile(body:ProfileInput){return parse(await apiMutation('/api/me/profile','PUT',body))}
