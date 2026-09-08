import { createOpening,type Opening } from '../engagement/opening'
import { QuestionEngagement } from '../engagement/QuestionEngagement'
import { AnswerSection } from '../answers/AnswerSection'
import { AdminAnswerSection } from '../adminAnswers/AdminAnswerSection'
import { useEffect,useLayoutEffect,useRef,useState } from 'react'
import { Link,useParams,useLocation } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { QuestionLoader } from './QuestionLoader'
import { QuestionContext } from './QuestionCard'
import { archiveQuestion,questionDate,type Question } from './questionApi'
export function QuestionDetailPage() {
  const {id=''}=useParams(),location=useLocation()
  const tab=new URLSearchParams(location.search).get('tab')==='community'?'community':'admin'
  return <QuestionOpening key={id+location.key} id={id} initialTab={tab} hash={location.hash}/>
}
function QuestionOpening({id,initialTab,hash}:{id:string;initialTab:string;hash:string}) {
  const [opening]=useState<Opening>(()=>createOpening())
  return <QuestionLoader id={id}>{(q,reload)=><QuestionDetail key={`${q.id}-${q.version}`} question={q} reload={reload} opening={opening} initialTab={initialTab} hash={hash}/>}</QuestionLoader>
}
function QuestionDetail({question:q,reload,opening,initialTab,hash}:{question:Question;reload:()=>void;opening:Opening;initialTab:string;hash:string}) {
  const auth=useAuth(),busy=useRef(false),[answersRevision,setAnswersRevision]=useState(0),[answerTab,setAnswerTab]=useState(initialTab)
  const [statistics,setStatistics]=useState(q.statistics)
  const [confirm,setConfirm]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null)
  const panel=useRef<HTMLDivElement>(null),[panelHeight,setPanelHeight]=useState(0)
  useLayoutEffect(()=>{if(!panel.current||typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(()=>setPanelHeight(h=>Math.max(h,panel.current?.scrollHeight??0)));observer.observe(panel.current);return()=>observer.disconnect()},[])
  useEffect(()=>{
    if(!hash)return
    let attempts=0
    const timer=window.setInterval(()=>{
      const target=document.getElementById(hash.slice(1))
      if(target){target.scrollIntoView({block:'center'});window.clearInterval(timer)}
      else if(++attempts>=20)window.clearInterval(timer)
    },100)
    return()=>window.clearInterval(timer)
  },[hash,answerTab])
  async function archive(){if(busy.current)return;busy.current=true;setPending(true);setError(null);try{await archiveQuestion(q.id,q.version);reload()}catch(e){setError(formError(e))}finally{busy.current=false;setPending(false)}}
  return <article className="question-detail"><Link className="back-link" to="/questions">← Sorulara dön</Link><QuestionContext question={q}/><h1>{q.title}</h1>
    <div className="question-meta question-byline"><div className="question-byline-author"><span>{q.authorName}</span><time dateTime={q.createdAt}>{questionDate(q.createdAt)}</time>{q.editedAt && <span>Düzenlendi · <time dateTime={q.editedAt}>{questionDate(q.editedAt)}</time></span>}</div><QuestionEngagement questionId={q.id} initial={q.statistics} archived={!!q.archivedAt} opening={opening} answersRevision={answersRevision} onStatistics={setStatistics}/></div>
    {q.archivedAt && <p className="archive-notice" role="status">Bu soru arşivlendi. Bağlantıdan okunabilir; yeni etkileşime kapalıdır.</p>}
    {q.body && <p className="question-body">{q.body}</p>}
    {auth.user?.id===q.authorId && !q.archivedAt && <div className="question-owner-actions"><Link className="button" to={`/questions/${q.id}/edit`}>Soruyu düzenle</Link><button className="button button-secondary" onClick={()=>setConfirm(true)}>Arşivle</button>
      {confirm && <div className="archive-confirm"><p>Soru listelerden kalkacak ve düzenlemeye kapanacak. Bağlantıdan okunmaya devam edecek.</p><button className="button" disabled={pending} onClick={()=>void archive()}>Arşivlemeyi onayla</button><button disabled={pending} onClick={()=>setConfirm(false)}>Vazgeç</button></div>}
    </div>}
    <AuthFormError error={error}/>{error?.code==='STALE_VERSION' && <button onClick={reload}>Güncel soruyu yükle</button>}
    <div className="answer-tabs" role="tablist" aria-label="Katkı türü">{[['admin',`Admin yorumları (${statistics.adminAnswerCount})`],['community',`Topluluk yorumları (${statistics.communityAnswerCount})`]].map(([value,label])=><button key={value} type="button" role="tab" id={'tab-'+value} aria-selected={answerTab===value} aria-controls={'panel-'+value} tabIndex={answerTab===value?0:-1} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'admin':e.key==='End'?'community':answerTab==='admin'?'community':'admin';setAnswerTab(next);document.getElementById('tab-'+next)?.focus()}}} onClick={()=>setAnswerTab(value)}>{label}</button>)}</div>
    <div style={{minHeight:panelHeight}}><div ref={panel} role="tabpanel" id={'panel-'+answerTab} aria-labelledby={'tab-'+answerTab}>
    {answerTab==='admin'?<AdminAnswerSection questionId={q.id} archived={!!q.archivedAt} onChanged={()=>setAnswersRevision(r=>r+1)}/>:<AnswerSection questionId={q.id} archived={!!q.archivedAt} reloadQuestion={reload} onChanged={()=>setAnswersRevision(r=>r+1)}/>}</div></div>
  </article>
}
