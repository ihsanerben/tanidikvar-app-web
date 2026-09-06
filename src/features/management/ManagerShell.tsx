import { useEffect,useRef,useState } from 'react'
import { Link,NavLink,Navigate,Route,Routes,useLocation,useParams } from 'react-router-dom'
import { ManagerPage } from './ManagerPage'
import { ApplicationsPage } from '../applications/ApplicationsPage'
import { CatalogPage } from '../catalog/CatalogPage'
import { ManagerAccountPage } from './ManagerAccountPage'
import { ApplicationReviewPage,UserDetailPage } from './ReviewPages'
import { QuestionReviewPage } from './QuestionReviewPage'
import { ActionHistoryPage,ActionDetailPage } from './ActionHistoryPage'
import { EmailActionPage } from '../auth/EmailActionPage'
const links=[['/manager','Özet'],['/manager/applications','Başvurular'],['/manager/users','Kullanıcılar'],['/manager/content','Sorular ve Cevaplar'],['/manager/catalog','Üniversiteler ve Bölümler'],['/manager/tags','Tagler'],['/manager/actions','İşlem Geçmişi'],['/manager/account','Hesabım']]
export function ManagerShell(){
 const [openedAt,setOpenedAt]=useState<string|null>(null),location=useLocation(),toggle=useRef<HTMLButtonElement>(null)
 const routeKey=location.pathname+location.search,open=openedAt===routeKey
 useEffect(()=>{if(!open)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpenedAt(null);toggle.current?.focus()}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[open])
 return <div className="manager-shell"><a className="skip-link" href="#manager-main">İçeriğe geç</a>
 <header className="manager-header"><button ref={toggle} className="manager-menu-toggle" aria-expanded={open} aria-controls="manager-sidebar" onClick={()=>setOpenedAt(open?null:routeKey)}>Menü</button><Link to="/manager" className="manager-brand">tanıdıkvar <span>Yönetim</span></Link><Link to="/manager/account">Yönetim hesabım</Link></header>
 <aside id="manager-sidebar" className={`manager-sidebar ${open?'is-open':''}`}><p>YÖNETİM PANELİ</p><nav aria-label="Yönetim menüsü">{links.map(([to,label])=><NavLink key={to} to={to} end={to==='/manager'}>{label}</NavLink>)}</nav></aside>
 <main id="manager-main" className="manager-main"><Routes>
 <Route path="/manager" element={<ManagerPage/>}/><Route path="/manager/users" element={<ManagerPage view="users"/>}/><Route path="/manager/content" element={<ManagerPage view="content"/>}/>
 <Route path="/manager/applications" element={<ApplicationsPage manager/>}/><Route path="/manager/applications/:id" element={<ApplicationReviewPage key={location.pathname}/>}/>
 <Route path="/manager/users/:id" element={<UserDetailPage key={location.pathname}/>}/><Route path="/manager/questions/:id" element={<QuestionReviewPage key={location.pathname}/>}/>
 <Route path="/manager/catalog" element={<CatalogPage/>}/><Route path="/manager/tags" element={<CatalogPage tags/>}/>
 <Route path="/manager/actions" element={<ActionHistoryPage key={location.search}/>}/><Route path="/manager/actions/:id" element={<ActionDetailPage key={location.pathname}/>}/>
 <Route path="/manager/account" element={<ManagerAccountPage/>}/><Route path="/account" element={<Navigate to="/manager/account" replace/>}/><Route path="/profile" element={<Navigate to="/manager/account" replace/>}/>
 <Route path="/questions/new" element={<Navigate to="/manager" replace/>}/><Route path="/questions/:id" element={<ModerationRedirect/>}/><Route path="/forgot-password" element={<EmailActionPage mode="forgot"/>}/><Route path="/reset-password" element={<EmailActionPage mode="reset"/>}/>
 <Route path="*" element={<Navigate to="/manager" replace/>}/>
 </Routes></main></div>
}
function ModerationRedirect(){const {id}=useParams();return <Navigate to={`/manager/questions/${id}`} replace/>}
