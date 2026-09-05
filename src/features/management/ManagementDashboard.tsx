import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import type { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { Page } from '../catalog/catalogApi'
import { questionDate } from '../questions/questionApi'
import { getStats,getActions,statLabels,type Stats,type ManagementAction } from './managementApi'
const actions:Record<string,string>={DISABLE_USER:'Hesap pasifleştirildi',RESTORE_USER:'Hesap geri yüklendi',HIDE_CONTENT:'İçerik gizlendi',RESTORE_CONTENT:'İçerik geri yüklendi',REVOKE_ADMIN:'Admin yetkisi kaldırıldı',APPROVED:'Başvuru onaylandı',REJECTED:'Başvuru reddedildi',CREATE:'Oluşturuldu',UPDATE:'Güncellendi',RENAME:'Adı güncellendi',SOFT_DELETE:'Pasife alındı',BOOTSTRAP_MANAGER:'Manager başlangıç yetkisi verildi',DELETE:'Kaldırıldı',RESTORE:'Geri yüklendi'}
export function ManagementDashboard(){
 const [data,setData]=useState<{stats:Stats;actions:Page<ManagementAction>}|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0),[page,setPage]=useState(0)
 useEffect(()=>{const c=new AbortController();Promise.all([getStats(c.signal),getActions(page,c.signal)]).then(([stats,actions])=>{if(!c.signal.aborted)setData({stats,actions})}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[page,revision])
 function reload(){setData(null);setError(null);setRevision(r=>r+1)}
 function changePage(n:number){setData(null);setError(null);setPage(n)}
 if(error)return <div className="auth-card"><AuthFormError error={error}/><button onClick={reload}>Tekrar dene</button></div>
 if(!data)return <p role="status">Platform bilgileri yükleniyor…</p>
 return <><p>Görünür içeriklerin tüm zamanlardaki toplamları. Görüntülenme her detay açılışını sayar; tekil ziyaretçi sayısı değildir.</p>
 <div className="management-stats">{Object.entries(statLabels).map(([key,label])=><div className="auth-card" key={key}><span>{label}</span><strong>{data.stats[key as keyof Stats].toLocaleString('tr-TR')}</strong></div>)}</div>
 <div className="answer-actions"><button onClick={reload}>Bilgileri yenile</button><Link to="/manager/applications">Bekleyen başvuruları incele</Link></div>
 <h2>İşlem geçmişi</h2>{data.actions.items.length===0?<p>Henüz yönetim işlemi yok.</p>:data.actions.items.map(a=><article className="question-card" key={a.id}><strong>{actions[a.action]??a.action}</strong><p>{a.reason??'Gerekçe gerektirmeyen katalog veya onay işlemi.'}</p><p className="question-meta"><time dateTime={a.occurredAt}>{questionDate(a.occurredAt)}</time></p><details><summary>İşlem kaydı</summary><p>İşlemi yapan: {a.actorId}</p><p>Hedef: {a.targetType} · {a.targetId}</p></details></article>)}
 <nav className="answer-actions" aria-label="İşlem geçmişi sayfaları"><button disabled={page===0} onClick={()=>changePage(page-1)}>Önceki</button><span>Sayfa {page+1}</span><button disabled={(page+1)*data.actions.size>=data.actions.totalElements} onClick={()=>changePage(page+1)}>Sonraki</button></nav></>
}
