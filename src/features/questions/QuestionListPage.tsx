import { SearchForm } from '../discovery/SearchForm'
import { useEffect,useState } from 'react'
import { Link,useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { RemotePicker } from '../catalog/RemotePicker'
import type { Page,Choice } from '../catalog/catalogApi'
import { useAuth } from '../auth/useAuth'
import { QuestionGate } from './QuestionGate'
import { QuestionCard } from './QuestionCard'
import { listQuestions,scopeLabels,type Question } from './questionApi'
export function QuestionListPage({mine=false,popular=false}:{mine?:boolean;popular?:boolean}) {
  const auth=useAuth()
  return mine?<QuestionGate profile={false}><QuestionList key={auth.user?.id} mine/></QuestionGate>:<QuestionList key={popular?'popular':'public'} popular={popular}/>
}
function QuestionList({mine=false,popular=false}:{mine?:boolean;popular?:boolean}) {
  const auth=useAuth()
  const [params,setParams]=useSearchParams()
  const [universityChoice,setUniversity]=useState<Choice|null>(params.get('universityId')?{id:params.get('universityId')!,label:'Seçili üniversite'}:null)
  const [educationChoice,setEducation]=useState<Choice|null>(params.get('universityDepartmentId')?{id:params.get('universityDepartmentId')!,label:'Seçili bölüm'}:null)
  const [departmentChoice,setDepartment]=useState<Choice|null>(null)
  const [tagChoice,setTag]=useState<Choice|null>(params.get('tagId')?{id:params.get('tagId')!,label:'Seçili tag'}:null)
  function selected(key:string,cached:Choice|null,label:string):Choice|null {const id=params.get(key);return id?{id,label:cached?.id===id?cached.label:label}:null}
  const university=selected('universityId',universityChoice,'Seçili üniversite')
  const education=selected('universityDepartmentId',educationChoice,'Seçili bölüm')
  const tag=selected('tagId',tagChoice,'Seçili tag')
  const department=selected('departmentId',departmentChoice,'Seçili bölüm adı')
  const [result,setResult]=useState<Page<Question>|null>(null)
  const [error,setError]=useState<ApiError|null>(null)
  const [loading,setLoading]=useState(true)
  const [revision,setRevision]=useState(0)
  const query=params.toString()
  const [loadedQuery,setLoadedQuery]=useState<string|null>(null)
  const waiting=loading||loadedQuery!==query
  useEffect(()=>{
    const controller=new AbortController()
    listQuestions(`${mine?'/api/me/questions':popular?'/api/popular':'/api/questions'}?${query}`,controller.signal).then(data=>{if(!controller.signal.aborted){setResult(data);setLoadedQuery(query);setError(null);setLoading(false)}})
      .catch(e=>{if(!controller.signal.aborted){setError(formError(e));setLoading(false)}})
    return ()=>controller.abort()
  },[mine,popular,query,revision,auth.user?.id])
  function filter(key:string,value:string|null){const next=new URLSearchParams(params);next.delete('page');if(value)next.set(key,value);else next.delete(key);setError(null);setLoading(true);setParams(next)}
  function page(value:number){const next=new URLSearchParams(params);next.set('page',String(value));setError(null);setLoading(true);setParams(next)}
  return <section className="questions-page"><div className="questions-heading"><div><span className="eyebrow">{mine?'BENİM PAYLAŞIMLARIM':popular?'TOPLULUĞUN GÜNDEMİ':'MERAK ETTİKLERİN BURADA'}</span><h1>{mine?'Sorularım':popular?'Popülerler':'Sorular'}</h1><p>{mine?'Aktif ve arşivlediğin sorularını buradan bulabilirsin.':popular?'Seçtiğin dönemde ilgi gören soruları keşfet. Kartlardaki sayılar tüm zamanların toplamıdır.':'Üniversiteyi ve bölümü, merak edilen sorulardan tanımaya başla.'}</p></div><Link className="button" to="/questions/new">Soru sor</Link></div>
    <div className="question-navigation"><Link to={mine?'/questions':'/my-questions'}>{mine?'Tüm sorular':'Sorularım'}</Link><Link to={popular?'/questions':'/popular'}>{popular?'Tüm sorular':'Popülerler'}</Link><Link to="/admins">Adminleri keşfet</Link></div>
    {!mine&&<SearchForm value={params.get('q')??''} onSearch={value=>filter('q',value)}/>}
    {popular&&<div className="popular-period"><label htmlFor="popular-period">Zaman aralığı</label><select id="popular-period" value={params.get('period')??'WEEKLY'} onChange={e=>filter('period',e.target.value)}><option value="DAILY">Günlük · Son 24 saat</option><option value="WEEKLY">Haftalık · Son 7 gün</option><option value="MONTHLY">Aylık · Son 30 gün</option><option value="YEARLY">Yıllık · Son 365 gün</option></select><p>Yeni etkileşimler daha ağırlıklıdır; Admin cevapları sıralamaya daha fazla katkı sağlar.</p></div>}
    {!mine&&params.get('adminId')&&<div className="archive-notice"><p>Seçilen Admin’in cevapladığı sorular gösteriliyor.</p><Link to={'/admins/'+encodeURIComponent(params.get('adminId')!)}>Admin profilini aç</Link> <button onClick={()=>filter('adminId',null)}>Admin filtresini kaldır</button></div>}
    {!mine && <details className="question-filters"><summary>Soruları filtrele</summary><div className="auth-card">
      <label htmlFor="scope-filter">Soru kapsamı</label><select id="scope-filter" value={params.get('scope')??''} onChange={e=>filter('scope',e.target.value)}><option value="">Tüm kapsamlar</option>{Object.entries(scopeLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select>
      <div className="form-columns"><RemotePicker label="Üniversite" endpoint="/api/universities" value={university} onChange={v=>{setUniversity(v);setEducation(null);const next=new URLSearchParams(params);next.delete('page');next.delete('universityDepartmentId');if(v)next.set('universityId',v.id);else next.delete('universityId');setError(null);setLoading(true);setParams(next)}}/>
      <RemotePicker key={university?.id??'none'} label="Bölüm" education disabled={!university} endpoint={`/api/universities/${university?.id}/departments`} value={education} onChange={v=>{setEducation(v);filter('universityDepartmentId',v?.id??null)}}/>
      <RemotePicker label="Tag" endpoint="/api/tags" value={tag} onChange={v=>{setTag(v);filter('tagId',v?.id??null)}}/></div>
      <RemotePicker label="Bölüm adı (tüm üniversiteler)" endpoint="/api/departments" value={department} onChange={v=>{setDepartment(v);filter('departmentId',v?.id??null)}}/>
      <button type="button" onClick={()=>{setDepartment(null);setError(null);setUniversity(null);setEducation(null);setTag(null);setLoading(true);setParams(popular?{period:params.get('period')??'WEEKLY'}:{});setRevision(r=>r+1)}}>Filtreleri temizle</button>
    </div></details>}
    {error?<div className="auth-card"><AuthFormError error={error}/><button onClick={()=>{setLoading(true);setRevision(r=>r+1)}}>Tekrar dene</button></div>:waiting?<p role="status">Sorular yükleniyor…</p>:result?.items.length===0?<div className="question-empty"><h2>{popular?'Bu dönemde popüler soru yok.':'Henüz soru yok.'}</h2><p>{mine?'İlk sorunu paylaşarak başlayabilirsin.':'Bu seçimlere uygun soru bulunamadı. Filtreleri değiştirebilir veya yeni bir soru sorabilirsin.'}</p></div>:<div className="question-list">{result?.items.map(q=><QuestionCard key={q.id} question={q}/>)}</div>}
    {result && !error && <div className="pagination"><button disabled={waiting||result.page===0} onClick={()=>page(result.page-1)}>Önceki sayfa</button><span>{result.totalElements} soru · Sayfa {result.page+1}</span><button disabled={waiting||(result.page+1)*result.size>=result.totalElements} onClick={()=>page(result.page+1)}>Sonraki sayfa</button></div>}
  </section>
}
