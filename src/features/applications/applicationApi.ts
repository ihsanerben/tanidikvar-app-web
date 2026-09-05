import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
export interface Application {id:string;applicantId:string;firstName:string;lastName:string;educationStatus:string;universityName:string;departmentName:string;graduationYear:number|null;occupation:string|null;company:string|null;documentFileId:string;status:'PENDING'|'APPROVED'|'REJECTED';submittedAt:string;reviewedBy:string|null;reviewedAt:string|null;rejectionReason:string|null;version:number;activeVerification:boolean}
export interface Applications {items:Application[];page:number;size:number;totalElements:number}
function parse(v:unknown):Application {
 if(!isRecord(v)||!['id','applicantId','firstName','lastName','educationStatus','universityName','departmentName','documentFileId','submittedAt'].every(k=>typeof v[k]==='string')||!['PENDING','APPROVED','REJECTED'].includes(String(v.status))||typeof v.version!=='number'||typeof v.activeVerification!=='boolean'||!['occupation','company','reviewedBy','reviewedAt','rejectionReason'].every(k=>v[k]===null||typeof v[k]==='string')||!(v.graduationYear===null||typeof v.graduationYear==='number'))throw new ApiError(200,'INVALID_RESPONSE','Başvuru bilgileri alınamadı.')
 return v as unknown as Application
}
export async function listApplications(manager:boolean,page:number,status:string,signal?:AbortSignal):Promise<Applications>{
 const v=await apiGet(`/api/${manager?'manager':'me'}/admin-applications?page=${page}&size=10${manager&&status?'&status='+status:''}`,signal)
 if(!isRecord(v)||!Array.isArray(v.items)||typeof v.totalElements!=='number'||typeof v.page!=='number'||typeof v.size!=='number')throw new ApiError(200,'INVALID_RESPONSE','Başvurular alınamadı.')
 return {items:v.items.map(parse),page:v.page,size:v.size,totalElements:v.totalElements}
}
export async function submitApplication(requestId:string,profileVersion:number,document:File){
 const data=new FormData();data.append('request',new Blob([JSON.stringify({requestId,profileVersion})],{type:'application/json'}));data.append('document',document)
 return parse(await apiMutation('/api/me/admin-applications','POST',data))
}
export async function decide(a:Application,status:'APPROVED'|'REJECTED',reason:string){return parse(await apiMutation(`/api/manager/admin-applications/${a.id}/decision`,'PUT',{status,reason,version:a.version}))}
export async function revoke(a:Application,reason:string){await apiMutation(`/api/manager/users/${a.applicantId}/revoke-admin`,'POST',{verificationId:a.id,reason})}
export async function downloadDocument(id:string){
 const data=await apiGet(`/api/files/${id}/download`,undefined,true)
 if(!(data instanceof Blob))throw new ApiError(200,'INVALID_RESPONSE','Belge indirilemedi.')
 const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download='belge.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}

