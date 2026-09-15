import { apiGet,apiMutation,apiPublicPost,ApiError,isRecord } from '../../api/apiClient'
export interface Statistics {viewCount:number;likeCount:number;communityAnswerCount:number;adminAnswerCount:number;totalAnswerCount:number}
export interface Like {liked:boolean;version:number}
export function statistics(value:unknown):Statistics {
 if(!isRecord(value)||['viewCount','likeCount','communityAnswerCount','adminAnswerCount','totalAnswerCount'].some(k=>!Number.isSafeInteger(value[k])||Number(value[k])<0))throw new ApiError(200,'INVALID_RESPONSE','Sayaçlar alınamadı.')
 if(value.totalAnswerCount!==Number(value.communityAnswerCount)+Number(value.adminAnswerCount))throw new ApiError(200,'INVALID_RESPONSE','Sayaçlar alınamadı.')
 return value as unknown as Statistics
}
function like(value:unknown):Like {
 if(!isRecord(value)||typeof value.liked!=='boolean'||!Number.isSafeInteger(value.version)||Number(value.version)<0)throw new ApiError(200,'INVALID_RESPONSE','Beğeni durumu alınamadı.')
 return value as unknown as Like
}
const path=(id:string)=>`/api/questions/${encodeURIComponent(id)}`
export async function getStatistics(id:string,signal?:AbortSignal){return statistics(await apiGet(path(id)+'/statistics',signal))}
export async function getLike(id:string,signal?:AbortSignal){return like(await apiGet(path(id)+'/like',signal))}
export async function setLike(id:string,value:Like){return like(await apiMutation(path(id)+'/like','PUT',value))}
export async function recordView(id:string,openingEventId:string){await apiPublicPost(path(id)+'/views',{openingEventId})}
