import { ProfileAvatar } from '../profile/ProfileAvatar'
import { useEffect,useState } from 'react'
import { Link,useSearchParams } from 'react-router-dom'
import { QuestionGate } from '../questions/QuestionGate'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
import type { Page } from '../catalog/catalogApi'
import { questionDate } from '../questions/questionApi'
import { myAnswers,type OwnAnswerEntry } from './answerApi'
export function MyAnswersPage(){
 const auth=useAuth()
 return <QuestionGate profile={false}><History key={auth.user?.id}/></QuestionGate>
}
function History(){
 const [params,setParams]=useSearchParams(),page=Math.max(0,Number(params.get('page'))||0),scope=params.get('scope')??'', [revision,setRevision]=useState(0)
 return <section className="questions-page"><div className="questions-heading"><h1>Topluluk yorumlarım</h1></div>
 <div className="history-scope-filter"><label>Kapsam<select value={scope} onChange={e=>{const p=new URLSearchParams();if(e.target.value)p.set('scope',e.target.value);setParams(p)}}><option value="">Tümü</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite ve bölüm</option></select></label></div><Entries key={`${page}:${scope}:${revision}`} page={page} scope={scope} setPage={n=>{const p=new URLSearchParams(params);p.set('page',String(n));setParams(p)}} retry={()=>setRevision(r=>r+1)}/><Link className="button button-secondary account-back-button" to="/account">Hesabıma dön</Link></section>
}
function Entries({page,scope,setPage,retry}:{page:number;scope:string;setPage:(n:number)=>void;retry:()=>void}){
 const [data,setData]=useState<Page<OwnAnswerEntry>|null>(null),[error,setError]=useState<ApiError|null>(null)
 useEffect(()=>{const c=new AbortController();myAnswers(page,scope,c.signal).then(d=>{if(!c.signal.aborted)setData(d)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[page,scope])
 if(error)return <div className="auth-card"><AuthFormError error={error}/><button className="button" onClick={retry}>Tekrar dene</button></div>
 if(!data)return <p role="status">Yorumların yükleniyor…</p>
 return <>{data.items.length===0?<div className="question-empty"><h2>Bu kapsamda yorumun yok.</h2></div>:<div className="question-list">{data.items.map(({answer:a,questionTitle})=><article className="question-card personal-comment-card" id={`yorum-${a.id}`} key={a.id}><h2><Link to={`/questions/${a.questionId}?tab=community#yorum-${a.id}`}>{questionTitle}</Link></h2><div className="answer-author"><ProfileAvatar fileId={a.avatarFileId} name={a.authorName} className="answer-avatar"/><strong>{a.authorName}</strong></div><p className="answer-body">{a.body}</p><div className="personal-comment-footer"><div className="question-meta"><time dateTime={a.publishedAt}>{questionDate(a.publishedAt)}</time>{a.editedAt&&<span>Düzenlendi · {questionDate(a.editedAt)}</span>}{a.deletedAt&&<span>Kaldırıldı</span>}{a.moderatedAt&&<span>Manager tarafından gizlendi</span>}</div><Link className="button button-secondary" to={`/questions/${a.questionId}?tab=community#yorum-${a.id}`}>Soru detayı</Link></div></article>)}</div>}
 {data.totalElements>data.size&&<nav className="pagination" aria-label="Yorum sayfaları"><button disabled={page===0} onClick={()=>setPage(page-1)}>Önceki sayfa</button><span>Sayfa {page+1}</span><button disabled={(page+1)*data.size>=data.totalElements} onClick={()=>setPage(page+1)}>Sonraki sayfa</button></nav>}</>
}
