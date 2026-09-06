import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AuthFormError } from '../auth/AuthFormError'
import { getStats,getActions,getContent } from './managementApi'
import { useManagerData } from './useManagerData'
import { actionLabels } from './actionLabels'
export function ManagementDashboard(){
 const loader=useCallback(async(signal:AbortSignal)=>{const [stats,actions,questions]=await Promise.all([getStats(signal),getActions(0,signal),getContent('kind=QUESTION&status=ALL&size=5',signal)]);return {stats,actions,questions}},[]),state=useManagerData(loader),d=state.data
 if(state.error)return <div className="auth-card"><AuthFormError error={state.error}/><button onClick={state.reload}>Tekrar dene</button></div>
 if(!d)return <p role="status">Platform bilgileri yükleniyor…</p>
 const cards=[{label:'Bekleyen başvuru',value:d.stats.pendingApplications,to:'/manager/applications'},{label:'Aktif kullanıcı',value:d.stats.activeUsers,to:'/manager/users?status=VISIBLE'},{label:'Aktif Admin',value:d.stats.activeAdmins,to:'/manager/users?status=VISIBLE&authority=ADMIN'},{label:'Aktif soru',value:d.stats.activeQuestions,to:'/manager/content?kind=QUESTION&status=VISIBLE'}]
 return <><div className="management-stats">{cards.map(c=><Link className="auth-card manager-stat-link" key={c.label} to={c.to}><span>{c.label}</span><strong>{c.value.toLocaleString('tr-TR')}</strong><span>İncele →</span></Link>)}</div><div className="manager-overview-grid"><section className="auth-card"><h2>Yeni sorular</h2>{d.questions.items.length===0?<p>Henüz soru yok.</p>:<ul className="manager-record-list">{d.questions.items.map(q=><li key={q.id}><Link to={`/manager/questions/${q.id}`}>{q.title}</Link><span>{q.authorName}{q.moderatedAt?' · Gizli':''}{q.archivedAt?' · Arşiv':''}</span></li>)}</ul>}<Link to="/manager/content">Tüm sorular ve cevaplar →</Link></section><section className="auth-card"><h2>Son yönetim işlemleri</h2>{d.actions.items.length===0?<p>Henüz yönetim işlemi yok.</p>:<ul className="manager-record-list">{d.actions.items.slice(0,5).map(a=><li key={a.id}><Link to={`/manager/actions/${a.id}`}>{actionLabels[a.action]??a.action}</Link><span>{new Date(a.occurredAt).toLocaleString('tr-TR')}</span>{a.reason&&<p>{a.reason}</p>}</li>)}</ul>}<Link to="/manager/actions">İşlem Geçmişi →</Link></section></div><button className="button button-secondary" onClick={state.reload}>Bilgileri yenile</button></>
}
