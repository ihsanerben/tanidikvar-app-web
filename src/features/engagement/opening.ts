import { recordView } from './engagementApi'
export interface Opening {record:(questionId:string)=>Promise<void>;retry:()=>void}
export function createOpening(id:string=crypto.randomUUID()):Opening {
 let request:Promise<void>|undefined
 return {record(questionId){return request??=recordView(questionId,id)},retry(){request=undefined}}
}
