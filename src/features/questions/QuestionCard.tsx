import { QuestionStats } from '../engagement/QuestionStats'
import { Link } from 'react-router-dom'
import { scopeLabels,questionDate,type Question } from './questionApi'
export function QuestionContext({question:q}:{question:Question}) {
  return <div className="question-context"><span className={`scope-badge scope-${q.scope.toLowerCase()}`}>{scopeLabels[q.scope]}</span>{q.universityName && <span>{q.universityName}{q.departmentName?` · ${q.departmentName}`:''}</span>}
    {q.tags.map(tag=><span className="question-tag" key={tag.id}>{tag.name}{!tag.available?' (pasif)':''}</span>)}</div>
}
export function QuestionCard({question:q}:{question:Question}) {
  return <article className="question-card"><QuestionContext question={q}/><h2><Link to={`/questions/${q.id}`}>{q.title}</Link></h2>
    {q.body && <p className="question-excerpt">{q.body}</p>}
    <div className="question-meta"><span>{q.authorName}</span><time dateTime={q.createdAt}>{questionDate(q.createdAt)}</time>{q.archivedAt && <span>Arşivlendi</span>}</div>
    <QuestionStats statistics={q.statistics}/>
  </article>
}
