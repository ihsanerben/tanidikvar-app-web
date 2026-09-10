import { Link,Navigate,useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AdminAnswerFeed } from './AdminAnswerFeed'
export function AdminPanelPage(){
 const auth=useAuth()
 if(auth.status==='loading')return <section className="status-page" role="status">Hesap yükleniyor…</section>
 if(auth.status==='error')return <section className="status-page"><h1>Hesaba ulaşılamadı.</h1><button onClick={auth.reload}>Tekrar dene</button></section>
 if(!auth.user)return <Navigate to="/login" replace/>
 return <Panel key={auth.user.id+auth.user.role+auth.user.profileCompleted}/>
}
function Panel(){
 const [params,setParams]=useSearchParams(),scope=params.get('scope')??''
 return <section className="questions-page admin-panel-page"><div className="questions-heading personal-history-heading"><h1>Admin yorumlarım</h1><div className="history-scope-filter"><label>Kapsam<select value={scope} onChange={e=>{const p=new URLSearchParams();if(e.target.value)p.set('scope',e.target.value);setParams(p)}}><option value="">Tümü</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite ve bölüm</option></select></label></div></div><AdminAnswerFeed key={scope} path={`/api/me/admin-answers${scope?`?scope=${scope}`:''}`} showQuestion/><Link className="button button-secondary account-back-button" to="/account">Hesabıma dön</Link></section>
}
