import { AnswerSection } from '../answers/AnswerSection'
import { AdminAnswerSection } from '../adminAnswers/AdminAnswerSection'
import { useRef,useState } from 'react'
import { Link,useParams } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { QuestionLoader } from './QuestionLoader'
import { QuestionContext } from './QuestionCard'
import { archiveQuestion,questionDate,type Question } from './questionApi'
export function QuestionDetailPage() {
  const {id=''}=useParams()
  return <QuestionLoader key={id} id={id}>{(q,reload)=><QuestionDetail key={`${q.id}-${q.version}`} question={q} reload={reload}/>}</QuestionLoader>
}
function QuestionDetail({question:q,reload}:{question:Question;reload:()=>void}) {
  const auth=useAuth(),busy=useRef(false)
  const [confirm,setConfirm]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null)
  async function archive(){if(busy.current)return;busy.current=true;setPending(true);setError(null);try{await archiveQuestion(q.id,q.version);reload()}catch(e){setError(formError(e))}finally{busy.current=false;setPending(false)}}
  return <article className="question-detail"><Link className="back-link" to="/questions">← Sorulara dön</Link><QuestionContext question={q}/><h1>{q.title}</h1>
    <div className="question-meta"><span>{q.authorName}</span><time dateTime={q.createdAt}>{questionDate(q.createdAt)}</time>{q.editedAt && <span>Düzenlendi · <time dateTime={q.editedAt}>{questionDate(q.editedAt)}</time></span>}</div>
    {q.archivedAt && <p className="archive-notice" role="status">Bu soru arşivlendi. Bağlantıdan okunabilir; yeni etkileşime kapalıdır.</p>}
    {q.body && <p className="question-body">{q.body}</p>}
    {auth.user?.id===q.authorId && !q.archivedAt && <div className="question-owner-actions"><Link className="button" to={`/questions/${q.id}/edit`}>Soruyu düzenle</Link><button className="button button-secondary" onClick={()=>setConfirm(true)}>Arşivle</button>
      {confirm && <div className="archive-confirm"><p>Soru listelerden kalkacak ve düzenlemeye kapanacak. Bağlantıdan okunmaya devam edecek.</p><button className="button" disabled={pending} onClick={()=>void archive()}>Arşivlemeyi onayla</button><button disabled={pending} onClick={()=>setConfirm(false)}>Vazgeç</button></div>}
    </div>}
    <AuthFormError error={error}/>{error?.code==='STALE_VERSION' && <button onClick={reload}>Güncel soruyu yükle</button>}
    <AdminAnswerSection questionId={q.id} archived={!!q.archivedAt}/>
    <AnswerSection questionId={q.id} archived={!!q.archivedAt} reloadQuestion={reload}/>
  </article>
}
