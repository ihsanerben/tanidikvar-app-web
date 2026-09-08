import { useEffect,useState } from 'react'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { getAnalytics,type Analytics,type AnalyticsMetric,type AnalyticsPoint } from './managementApi'

const colors:Record<AnalyticsMetric,string>={users:'#3f83c5',questions:'#7957a8',communityAnswers:'#2f8f57',adminAnswers:'#d4a72c',views:'#3f6b61',likes:'#c02f62',applications:'#687386',approvedApplications:'#2f8f57',rejectedApplications:'#bd3e4d'}
const labels:Record<AnalyticsMetric,string>={users:'Yeni kullanıcı',questions:'Yeni soru',communityAnswers:'Topluluk yorumu',adminAnswers:'Admin yorumu',views:'Görüntülenme',likes:'Beğeni',applications:'Başvuru',approvedApplications:'Onay',rejectedApplications:'Ret'}
const groups:{title:string;description:string;metrics:AnalyticsMetric[]}[]=[
 {title:'Büyüme',description:'Yeni hesap ve soru üretiminin günlük seyri.',metrics:['users','questions']},
 {title:'Katkılar',description:'Topluluk ve doğrulanmış Admin yorumlarının karşılaştırması.',metrics:['communityAnswers','adminAnswers']},
 {title:'Etkileşim',description:'Soruların aldığı görüntülenme ve beğeniler.',metrics:['views','likes']},
 {title:'Admin başvuruları',description:'Gönderim ve kararların günlük dağılımı.',metrics:['applications','approvedApplications','rejectedApplications']},
]
function istanbulToday(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const value=(type:string)=>parts.find(p=>p.type===type)?.value;return `${value('year')}-${value('month')}-${value('day')}`}
function minusDays(date:string,days:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10)}
function LineChart({points,metrics,title}:{points:AnalyticsPoint[];metrics:AnalyticsMetric[];title:string}){
 const width=720,height=230,pad=34,max=Math.max(1,...points.flatMap(p=>metrics.map(m=>p[m]))),x=(i:number)=>pad+(points.length<2?0:i*(width-pad*2)/(points.length-1)),y=(v:number)=>height-pad-v*(height-pad*2)/max
 return <div className="analytics-chart-wrap"><svg className="analytics-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title} grafiği; en yüksek günlük değer ${max}`}>
  {[0,.25,.5,.75,1].map(n=><line key={n} x1={pad} x2={width-pad} y1={y(max*n)} y2={y(max*n)} className="chart-grid"/>)}
  {metrics.map(metric=><polyline key={metric} points={points.map((p,i)=>`${x(i)},${y(p[metric])}`).join(' ')} fill="none" stroke={colors[metric]} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>)}</svg>
  <div className="chart-axis"><span>{points[0]?.date??'—'}</span><span>En yüksek {max.toLocaleString('tr-TR')}</span><span>{points.at(-1)?.date??'—'}</span></div></div>
}
export function AnalyticsPage(){
 const today=istanbulToday(),[from,setFrom]=useState(minusDays(today,29)),[to,setTo]=useState(today),[applied,setApplied]=useState({from:minusDays(today,29),to:today}),[data,setData]=useState<Analytics|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const c=new AbortController();getAnalytics(applied.from,applied.to,c.signal).then(v=>{if(!c.signal.aborted){setData(v);setError(null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[applied,revision])
 function preset(days:number){const next={from:minusDays(today,days-1),to:today};setFrom(next.from);setTo(next.to);setData(null);setApplied(next)}
 return <section className="management-page analytics-page"><div className="analytics-heading"><div><span className="eyebrow">RAPORLAMA</span><h1>Grafikler</h1><p>Platform hareketlerini İstanbul gün sınırlarıyla karşılaştır.</p></div><div className="analytics-presets" aria-label="Hazır tarih aralıkları">{[7,30,90].map(days=><button key={days} className="button button-secondary" onClick={()=>preset(days)}>Son {days} gün</button>)}</div></div>
 <form className="auth-card analytics-filter" onSubmit={e=>{e.preventDefault();setData(null);setApplied({from,to})}}><label>Başlangıç tarihi<input type="date" required value={from} max={to} onChange={e=>setFrom(e.target.value)}/></label><label>Bitiş tarihi<input type="date" required value={to} min={from} onChange={e=>setTo(e.target.value)}/></label><button className="button">Grafikleri getir</button></form>
 {error?<div className="auth-card"><AuthFormError error={error}/><button onClick={()=>{setData(null);setRevision(r=>r+1)}}>Tekrar dene</button></div>:!data?<p role="status">Grafikler yükleniyor…</p>:<AnalyticsContent data={data}/>}</section>
}
function AnalyticsContent({data}:{data:Analytics}){return <><div className="analytics-period"><strong>{data.dateFrom} – {data.dateTo}</strong><span>{data.points.length} gün · {data.timezone}</span></div><div className="analytics-kpis">{(['users','questions','communityAnswers','adminAnswers','views','likes'] as AnalyticsMetric[]).map(key=><article className="auth-card" key={key}><span>{labels[key]}</span><strong>{data.totals[key].toLocaleString('tr-TR')}</strong><small>seçili dönemde</small></article>)}</div><div className="analytics-grid">{groups.map(group=><article className="auth-card analytics-panel" key={group.title}><div><h2>{group.title}</h2><p>{group.description}</p></div><div className="chart-legend">{group.metrics.map(m=><span key={m}><i style={{background:colors[m]}}/>{labels[m]} · {data.totals[m].toLocaleString('tr-TR')}</span>)}</div><LineChart points={data.points} metrics={group.metrics} title={group.title}/></article>)}</div><details className="auth-card analytics-table"><summary>Günlük verileri tablo olarak göster</summary><div><table><thead><tr><th>Tarih</th><th>Kullanıcı</th><th>Soru</th><th>Yorum</th><th>Görüntülenme</th><th>Beğeni</th></tr></thead><tbody>{data.points.map(p=><tr key={p.date}><th>{p.date}</th><td>{p.users}</td><td>{p.questions}</td><td>{p.communityAnswers+p.adminAnswers}</td><td>{p.views}</td><td>{p.likes}</td></tr>)}</tbody></table></div></details></>}
