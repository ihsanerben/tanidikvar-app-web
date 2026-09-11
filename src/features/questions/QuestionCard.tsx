import { QuestionStats } from '../engagement/QuestionStats'
import { Link } from 'react-router-dom'
import { scopeLabels,questionDate,type Question } from './questionApi'
import { ProfileTrigger } from '../profile/PublicProfilePopup'
export function QuestionContext({question:q}:{question:Question}) {
  const scopeText=q.scope==='GENERAL'?'':q.scope==='UNIVERSITY'?(q.universityName??'Üniversite'):[q.universityName,q.departmentName].filter(Boolean).join(' · ')
  return <div className="question-context"><span className={`scope-badge scope-${q.scope.toLowerCase()}${q.scope==='GENERAL'?' scope-dot-only':''}`} aria-label={scopeLabels[q.scope]}>{scopeText}</span>
    {q.tags.map(tag=><span className="question-tag" key={tag.id}>#{tag.name}{!tag.available?' (pasif)':''}</span>)}</div>
}
export function QuestionCard({question:q,onRestore}:{question:Question;onRestore?:()=>Promise<void>}) {
  return <article className={`question-card${q.archivedAt?' is-archived':''}`}><QuestionContext question={q}/><h2><Link to={`/questions/${q.id}`}>{q.title}</Link></h2>
    {q.body && <p className="question-excerpt">{q.body}</p>}
    <div className="question-meta question-byline"><div className="question-byline-author"><ProfileTrigger id={q.authorId} name={q.authorName} avatarFileId={q.avatarFileId} educationStatus={q.educationStatus} isAdmin={q.activeAdmin} detailHref={q.authorId?`/profiles/${q.authorId}`:undefined}/><time dateTime={q.createdAt}>{questionDate(q.createdAt)}</time>{q.archivedAt && <span>Pasif</span>}</div><QuestionStats statistics={q.statistics}/></div>{onRestore&&<div className="question-card-actions"><button className="button button-secondary" type="button" onClick={()=>void onRestore()}>Tekrar aktife al</button></div>}
  </article>
}
