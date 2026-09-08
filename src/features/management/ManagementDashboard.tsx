import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AuthFormError } from '../auth/AuthFormError'
import { getStats,statLabels } from './managementApi'
import { useManagerData } from './useManagerData'
export function ManagementDashboard(){
 const loader=useCallback(async(signal:AbortSignal)=>({stats:await getStats(signal)}),[]),state=useManagerData(loader),d=state.data
 if(state.error)return <div className="auth-card"><AuthFormError error={state.error}/><button onClick={state.reload}>Tekrar dene</button></div>
 if(!d)return <p role="status">Platform bilgileri yükleniyor…</p>
 const routes={activeUsers:'/manager/users?status=VISIBLE',disabledUsers:'/manager/users?status=HIDDEN',activeAdmins:'/manager/users?status=VISIBLE&authority=ADMIN',pendingApplications:'/manager/applications',activeQuestions:'/manager/content?kind=QUESTION&status=VISIBLE',archivedQuestions:'/manager/content?kind=QUESTION&status=ALL',hiddenQuestions:'/manager/content?kind=QUESTION&status=HIDDEN',communityAnswers:'/manager/content?kind=COMMUNITY&status=ALL',adminAnswers:'/manager/content?kind=ADMIN&status=ALL',likes:'/manager/analytics',views:'/manager/analytics'} as const
 return <><div className="management-stats">{Object.entries(statLabels).map(([key,label])=><Link className="auth-card manager-stat-link" key={key} to={routes[key as keyof typeof routes]}><span>{label}</span><strong>{d.stats[key as keyof typeof d.stats].toLocaleString('tr-TR')}</strong><span>İncele →</span></Link>)}</div><button className="button button-secondary" onClick={state.reload}>İstatistikleri yenile</button></>
}
