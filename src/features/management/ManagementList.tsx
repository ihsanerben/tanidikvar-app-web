import { useEffect,useState,type FormEvent } from 'react'
import { Link,useSearchParams } from 'react-router-dom'
import type { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { Page } from '../catalog/catalogApi'
import { getUsers,getContent,userStatus,contentStatus,type ManagedUser,type ManagedContent } from './managementApi'
import { ManagementDecision } from './ManagementDecision'
export function ManagementList({users}:{users:boolean}){
 const [params,setParams]=useSearchParams(),[data,setData]=useState<Page<ManagedUser>|Page<ManagedContent>|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 const query=params.toString(),page=Math.max(0,Number(params.get('page'))||0)
 useEffect(()=>{const c=new AbortController();const p=new URLSearchParams(query);p.set('size','20');(users?getUsers(p.toString(),c.signal):getContent(p.toString(),c.signal)).then(v=>{if(!c.signal.aborted)setData(v)}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[users,query,revision])
 function reload(){setData(null);setError(null);setRevision(r=>r+1)}
 function navigate(p:URLSearchParams){setData(null);setError(null);setParams(p)}
 function filter(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget),p=new URLSearchParams();for(const key of ['q','status','kind','authority']){const v=f.get(key);if(typeof v==='string'&&v)p.set(key,v)}navigate(p)}
 function changePage(n:number){const p=new URLSearchParams(params);p.set('page',String(n));navigate(p)}
 return <><p>{users?'Pasifleştirme tüm oturumları kapatır, Admin yetkisini kaldırır ve bekleyen başvuruları reddeder. İçerikler korunur.':'Soru ve cevapları gerekçeyle gizle veya geri yükle. İçerik metinleri yazarlarına aittir.'}</p>
 <form key={query} className="auth-card management-filters" onSubmit={filter}><label>{users?'Ad veya e-posta':'İçerikte ara'}<input name="q" defaultValue={params.get('q')??''} maxLength={100}/></label>
 {!users&&<label>İçerik türü<select name="kind" defaultValue={params.get('kind')??'QUESTION'}><option value="QUESTION">Sorular</option><option value="COMMUNITY">Topluluk cevapları</option><option value="ADMIN">Admin cevapları</option></select></label>}
 {users&&<label>Yetki<select name="authority" defaultValue={params.get('authority')??''}><option value="">Tümü</option><option value="MEMBER">Üye</option><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option></select></label>}
 <label>Görünürlük<select name="status" defaultValue={params.get('status')??'ALL'}><option value="ALL">Tümü</option><option value="VISIBLE">{users?'Aktif hesaplar':'Görünür içerikler'}</option><option value="HIDDEN">{users?'Pasif hesaplar':'Manager tarafından gizlenenler'}</option></select></label><button className="button">Filtrele</button></form>
 {error?<div className="auth-card"><AuthFormError error={error}/><button onClick={reload}>Tekrar dene</button></div>:!data?<p role="status">Liste yükleniyor…</p>:<>
 {data.items.length===0?<p>Eşleşen kayıt bulunamadı.</p>:data.items.map(a=><article className="question-card" key={a.id+'-'+a.version}>{'email' in a?<><h2><Link to={'/manager/users/'+a.id}>{a.name??'Profil tamamlanmamış'}</Link></h2><p>{a.email}</p><p>{a.authority} · {a.educationStatus??'USER'} · {a.deletedAt?'Pasif':'Aktif'} · {a.emailVerified?'E-posta doğrulanmış':'E-posta doğrulanmamış'}</p>
 {a.authority==='MANAGER'?<p>Manager hesabı panelden pasifleştirilemez.</p>:<ManagementDecision label={a.deletedAt?'Hesabı geri yükle':'Hesabı pasifleştir'} explanation={a.deletedAt?'Kullanıcı yeniden giriş yapabilir. Eski oturumlar ve Admin yetkisi geri açılmaz.':'Tüm oturumlar kapanır. Admin yetkisi kaldırılır ve bekleyen başvurular reddedilir. İçeriklerde yazar Katılımcı olarak görünür.'} apply={reason=>userStatus(a,reason)} reload={reload}/>}</>:<><h2><Link to={'/manager/questions/'+a.questionId}>{a.title}</Link></h2><p>{a.authorName} · {a.moderatedAt?'Manager tarafından gizlendi':a.deletedAt?'Sahibi kaldırdı':'Görünür'}{a.archivedAt?' · Soru arşivlenmiş':''}</p>{a.questionHidden&&<p>Bağlı soru gizlenmiş; cevap herkese kapalı.</p>}<p className="answer-body">{a.body}</p>{!a.questionHidden&&(a.kind!=='QUESTION'||!a.moderatedAt)&&<p><Link to={'/manager/questions/'+a.questionId}>Soruyu aç</Link></p>}
 <ManagementDecision label={a.moderatedAt?'İçeriği geri yükle':'İçeriği gizle'} explanation={a.moderatedAt?'Manager gizlemesi kaldırılacak. Sahibinin kaldırdığı cevap ve sorunun arşiv durumu korunur. Bağlı soru gizliyse cevap görünmez.':'İçerik herkese açık ekranlardan kaldırılacak. Metin ve geçmiş kayıtları korunacak.'} apply={reason=>contentStatus(a,reason)} reload={reload}/></>}</article>)}
 <nav className="answer-actions" aria-label="Yönetim listesi sayfaları"><button disabled={page===0} onClick={()=>changePage(page-1)}>Önceki</button><span>Sayfa {page+1} · {data.totalElements} kayıt</span><button disabled={(page+1)*data.size>=data.totalElements} onClick={()=>changePage(page+1)}>Sonraki</button></nav></>}
 </>
}
