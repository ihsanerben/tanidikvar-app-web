import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { OwnAdminAnswer } from './OwnAdminAnswer'
import { AdminAnswerFeed } from './AdminAnswerFeed'
export function AdminAnswerSection({questionId,archived,composeRevision,onComposeType,onChanged}:{questionId:string;archived:boolean;composeRevision?:number;onComposeType?:(type:string)=>void;onChanged?:()=>void}){
 const auth=useAuth(),[revision,setRevision]=useState(0),[ownId,setOwnId]=useState<string|null>(null)
 return <section className="answer-section admin-answer-section" aria-label="Admin yorumları">
 {auth.status==='ready'&&auth.user&&<OwnAdminAnswer key={questionId+auth.user.id+auth.user.role+auth.user.profileCompleted} loadRevision={revision} onLoaded={setOwnId} questionId={questionId} archived={archived} composeRevision={composeRevision} onComposeType={onComposeType} reload={()=>{setRevision(r=>r+1);onChanged?.()}}/>}
 <AdminAnswerFeed excludeId={ownId} key={questionId+':'+revision} path={'/api/questions/'+questionId+'/admin-answers'}/></section>
}
