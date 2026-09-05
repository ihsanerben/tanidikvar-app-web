import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { OwnAdminAnswer } from './OwnAdminAnswer'
import { AdminAnswerFeed } from './AdminAnswerFeed'
export function AdminAnswerSection({questionId,archived}:{questionId:string;archived:boolean}){
 const auth=useAuth(),[revision,setRevision]=useState(0)
 return <section className="answer-section" aria-labelledby="admin-answers-heading"><div className="answer-heading"><span className="eyebrow">DOĞRULANMIŞ DENEYİMLER</span><h2 id="admin-answers-heading">Admin Cevapları</h2><p>Bu cevaplar, eğitim belgesi onaylanmış kişiler tarafından yayımlandı.</p></div>
 {auth.status==='ready'&&auth.user&&<OwnAdminAnswer key={questionId+auth.user.id+auth.user.role+auth.user.profileCompleted+':'+revision} questionId={questionId} archived={archived} reload={()=>setRevision(r=>r+1)}/>}
 <AdminAnswerFeed key={questionId+':'+revision} path={'/api/questions/'+questionId+'/admin-answers'}/></section>
}
