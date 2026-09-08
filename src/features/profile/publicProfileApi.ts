import { ApiError,isRecord } from '../../api/apiClient'
export interface PublicProfile {id:string;name:string;role:string;educationStatus:string;universityName:string|null;departmentName:string|null;graduationYear:number|null;biography:string|null;occupation:string|null;company:string|null;linkedinUrl:string|null;portfolioUrl:string|null;avatarFileId:string|null}
export function publicProfile(value:unknown):PublicProfile {
 if(!isRecord(value)||!['id','name','role','educationStatus'].every(k=>typeof value[k]==='string')||!['universityName','departmentName','biography','occupation','company','linkedinUrl','portfolioUrl','avatarFileId'].every(k=>value[k]===null||typeof value[k]==='string')||!(value.graduationYear===null||typeof value.graduationYear==='number'))throw new ApiError(200,'INVALID_RESPONSE','Profil bilgileri alınamadı.')
 return value as unknown as PublicProfile
}
