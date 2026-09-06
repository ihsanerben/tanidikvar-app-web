import { ProfileTrigger } from '../profile/PublicProfilePopup'
import { Link } from 'react-router-dom'
import { questionDate } from '../questions/questionApi'
import { type AdminAnswer } from './adminAnswerApi'
export function AdminAnswerCard({answer:a,showQuestion=false}:{answer:AdminAnswer;showQuestion?:boolean}){
 return <article className="answer-card admin-answer-card">{showQuestion&&<h3><Link to={'/questions/'+a.questionId}>{a.questionTitle}</Link></h3>}
 <div className="admin-author"><div><strong><ProfileTrigger id={a.authorId} name={a.authorName} avatarFileId={a.avatarFileId}/></strong>
 {a.authorId&&<p className="admin-badge">{a.activeAdmin?'Doğrulanmış Admin':'Artık Admin değil'}</p>}</div></div>
 {a.universityName&&<p className="question-meta">{a.universityName} · {a.departmentName} · {a.educationStatus==='MEZUN'?`${a.graduationYear} Mezunu`:'Üniversite Öğrencisi'} <span>(ilk yayınındaki doğrulama)</span></p>}
 {(a.occupation||a.company)&&<p className="question-meta">{a.occupation} {a.company&&'· '+a.company} · Güncel kişisel beyan</p>}
 <p className="answer-body">{a.body}</p><div className="question-meta"><time dateTime={a.publishedAt}>{questionDate(a.publishedAt)}</time>{a.editedAt&&<span>Düzenlendi · <time dateTime={a.editedAt}>{questionDate(a.editedAt)}</time></span>}{a.moderatedAt&&<span>Manager tarafından gizlendi</span>}{a.deletedAt&&<span>Kaldırılmış cevap · yalnız sen görüyorsun</span>}</div></article>
}

