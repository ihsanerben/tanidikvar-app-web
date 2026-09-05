import { useRef,useState,type FormEvent } from 'react'
import { Link,useNavigate,useParams } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { RemotePicker } from '../catalog/RemotePicker'
import type { Choice } from '../catalog/catalogApi'
import { QuestionGate } from './QuestionGate'
import { QuestionLoader } from './QuestionLoader'
import { createQuestion,updateQuestion,scopeLabels,type Scope,type Question } from './questionApi'
export function QuestionFormPage({edit=false}:{edit?:boolean}) {
  const {id=''}=useParams(),auth=useAuth()
  return <QuestionGate>{edit?<QuestionLoader key={id} id={id}>{(q,reload)=>q.authorId!==auth.user?.id?<section className="status-page"><h1>Bu soruyu düzenleyemezsin.</h1></section>:q.archivedAt?<section className="status-page"><h1>Bu soru arşivlenmiş.</h1><Link to={`/questions/${id}`}>Soruyu oku</Link></section>:<QuestionForm key={`${q.id}-${q.version}`} initial={q} reload={reload}/>}</QuestionLoader>:<QuestionForm key={auth.user?.id}/>}</QuestionGate>
}
function QuestionForm({initial,reload}:{initial?:Question;reload?:()=>void}) {
  const navigate=useNavigate(),busy=useRef(false),form=useRef<HTMLFormElement>(null)
  const [requestId]=useState(()=>crypto.randomUUID())
  const [title,setTitle]=useState(initial?.title??''),[body,setBody]=useState(initial?.body??'')
  const [scope,setScope]=useState<Scope>(initial?.scope??'GENERAL')
  const [university,setUniversity]=useState<Choice|null>(initial?.universityId?{id:initial.universityId,label:initial.universityName!}:null)
  const [education,setEducation]=useState<Choice|null>(initial?.universityDepartmentId?{id:initial.universityDepartmentId,label:initial.departmentName!}:null)
  const [tags,setTags]=useState<Choice[]>(initial?.tags.map(t=>({id:t.id,label:t.name}))??[])
  const [error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false)
  const field=(key:string)=>error?.fieldErrors[key]
  function message(key:string){return field(key)?<p className="field-error" id={`question-${key}-error`}>{field(key)}</p>:null}
  async function submit(event:FormEvent){event.preventDefault();if(busy.current)return
    if(scope==='UNIVERSITY'&&!university || scope==='UNIVERSITY_DEPARTMENT'&&!education){setError(new ApiError(400,'VALIDATION_FAILED','Kapsama uygun üniversite ve bölüm seç.',undefined,{scope:'Kapsama uygun üniversite ve bölüm seç.'}));return}
    busy.current=true;setPending(true);setError(null)
    const content={title,body,scope,universityId:scope==='UNIVERSITY'?university?.id??null:null,universityDepartmentId:scope==='UNIVERSITY_DEPARTMENT'?education?.id??null:null,tagIds:tags.map(t=>t.id)}
    try{const q=initial?await updateQuestion(initial.id,initial.version,content):await createQuestion(requestId,content);navigate(`/questions/${q.id}`)}
    catch(e){setError(formError(e));requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus())}
    finally{busy.current=false;setPending(false)}
  }
  return <section className="question-form-page"><span className="eyebrow">MERAKINI PAYLAŞ</span><h1>{initial?'Sorunu düzenle.':'Aklında ne var?'}</h1><p>Sorunu açıkça anlat; benzer bir soru olsa da kendi sorunu paylaşabilirsin.</p>
    <form className="auth-card" onSubmit={submit} ref={form}><fieldset disabled={pending}><legend>Soru bilgileri</legend>
      <label htmlFor="question-title">Soru başlığı</label><input id="question-title" required minLength={10} maxLength={200} value={title} onChange={e=>setTitle(e.target.value)} aria-invalid={!!field('title')} aria-describedby={field('title')?'question-title-error':undefined}/>{message('title')}
      <label htmlFor="question-body">Açıklama (isteğe bağlı)</label><textarea id="question-body" rows={6} maxLength={5000} value={body} onChange={e=>setBody(e.target.value)} aria-invalid={!!field('body')} aria-describedby={field('body')?'question-body-error':undefined}/>{message('body')}
      <label htmlFor="question-scope">Soru kapsamı</label><select id="question-scope" value={scope} onChange={e=>setScope(e.target.value as Scope)} aria-invalid={!!field('scope')} aria-describedby={field('scope')?'question-scope-error':undefined}>{Object.entries(scopeLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>{message('scope')}
      {scope!=='GENERAL' && <div className="form-columns"><RemotePicker label="Üniversite" endpoint="/api/universities" value={university} onChange={v=>{setUniversity(v);setEducation(null)}} error={field('universityId')}/>
      {scope==='UNIVERSITY_DEPARTMENT' && <RemotePicker key={university?.id??'none'} label="Bölüm" education endpoint={`/api/universities/${university?.id}/departments`} disabled={!university} value={education} onChange={setEducation} error={field('universityDepartmentId')}/>}</div>}
      <p className="field-help">Konuyu daraltmak için en fazla 5 tag seçebilirsin.</p>
      {tags.length<5 && <RemotePicker label="Tag ekle" endpoint="/api/tags" value={null} onChange={v=>{if(v&&!tags.some(t=>t.id===v.id))setTags([...tags,v])}} error={field('tagIds')}/>}
      <ul className="selected-tags">{tags.map(t=><li key={t.id}><span>{t.label}</span><button type="button" aria-label={`${t.label} tagini kaldır`} onClick={()=>setTags(tags.filter(tag=>tag.id!==t.id))}>×</button></li>)}</ul>{message('tagIds')}
    </fieldset><AuthFormError error={error}/>{error?.code==='STALE_VERSION' && <button type="button" onClick={reload}>Güncel soruyu yükle</button>}
      <button className="button" disabled={pending}>{pending?'Kaydediliyor…':initial?'Değişiklikleri kaydet':'Soruyu yayınla'}</button><Link to={initial?`/questions/${initial.id}`:'/questions'}>Vazgeç</Link>
    </form></section>
}
