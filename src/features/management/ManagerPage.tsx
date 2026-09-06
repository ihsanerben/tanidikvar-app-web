import { Navigate,Link,useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ManagementDashboard } from './ManagementDashboard'
import { ManagementList } from './ManagementList'
export function ManagerPage({view='dashboard'}:{view?:'dashboard'|'users'|'content'}){
 const auth=useAuth(),location=useLocation()
 if(auth.status==='loading')return <section className="status-page" role="status">Hesabın yükleniyor…</section>
 if(auth.status==='error')return <section className="status-page"><h1>Hesabına ulaşılamadı.</h1><button onClick={auth.reload}>Tekrar dene</button></section>
 if(!auth.user)return <Navigate to="/login" replace/>
 if(auth.user.role!=='MANAGER')return <section className="status-page"><h1>Bu sayfaya erişim iznin yok.</h1><Link to="/account">Hesabıma dön</Link></section>
 return <section className="management-page"><h1>{view==='dashboard'?'Platforma genel bakış':view==='users'?'Kullanıcı yönetimi':'İçerik moderasyonu'}</h1>
 {view==='dashboard'?<ManagementDashboard key={auth.user.id}/>:<ManagementList key={auth.user.id+view+location.search} users={view==='users'}/>}
 </section>
}
