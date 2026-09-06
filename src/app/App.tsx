import { ManagerShell } from '../features/management/ManagerShell'
import { useProfileSummary,roleLabels } from '../features/profile/useProfileSummary'
import { MyAnswersPage } from '../features/answers/MyAnswersPage'
import { ManagerPage } from '../features/management/ManagerPage'
import { AdminDirectoryPage } from '../features/discovery/AdminDirectoryPage'
import { QuestionListPage } from '../features/questions/QuestionListPage'
import { ApplicationsPage } from '../features/applications/ApplicationsPage'
import { AdminPanelPage } from '../features/adminAnswers/AdminPanelPage'
import { AdminProfilePage } from '../features/adminAnswers/AdminProfilePage'
import { QuestionDetailPage } from '../features/questions/QuestionDetailPage'
import { QuestionFormPage } from '../features/questions/QuestionFormPage'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { CredentialsPage } from '../features/auth/CredentialsPage'
import { EmailActionPage } from '../features/auth/EmailActionPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { AccountPage } from '../features/auth/AccountPage'
import { useAuth } from '../features/auth/useAuth'
import { StatusPage } from '../features/status/StatusPage'

export function App() {
  const auth = useAuth()
  if(auth.status==='loading')return <main className="status-page"><p role="status">Hesabın yükleniyor…</p></main>
  if(auth.user?.role==='MANAGER')return <ManagerShell key={auth.user.id}/>
  return <>
    <a className="skip-link" href="#main">İçeriğe geç</a>
    <header className="site-header"><Link className="brand" to="/" aria-label="TanıdıkVar sorular"><span className="brand-mark" aria-hidden="true">t.</span>tanıdık<span>var</span></Link>
      <nav className="primary-nav" aria-label="Ana menü"><NavLink to="/questions">Sorular</NavLink><NavLink to="/popular">Popülerler</NavLink><NavLink to="/admins">Adminler</NavLink><NavLink to="/about">Hakkımızda</NavLink></nav>
      <nav className="auth-nav" aria-label="Hesap">{auth.user?<HeaderIdentity key={auth.user.id} userId={auth.user.id} role={auth.user.role}/>:<><Link to="/login">Giriş yap</Link><Link className="button" to="/register">Kayıt ol</Link></>}</nav></header>
    <main id="main"><Routes>
      <Route path="/login" element={<CredentialsPage key="login" mode="login" />} />
      <Route path="/register" element={<CredentialsPage key="register" mode="register" />} />
      <Route path="/verify-email" element={<EmailActionPage key="verify" mode="verify" />} />
      <Route path="/resend-verification" element={<EmailActionPage key="resend" mode="resend" />} />
      <Route path="/forgot-password" element={<EmailActionPage key="forgot" mode="forgot" />} />
      <Route path="/reset-password" element={<EmailActionPage key="reset" mode="reset" />} />
      <Route path="/questions" element={<QuestionListPage />} />
      <Route path="/popular" element={<QuestionListPage popular />} />
      <Route path="/admins" element={<AdminDirectoryPage />} />
      <Route path="/my-answers" element={<MyAnswersPage />} />
      <Route path="/my-questions" element={<Navigate to="/questions" replace />} />
      <Route path="/questions/new" element={<QuestionFormPage />} />
      <Route path="/questions/:id/edit" element={<QuestionFormPage edit />} />
      <Route path="/questions/:id" element={<QuestionDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/admin" element={<AdminPanelPage />} />
      <Route path="/admins/:id" element={<AdminProfilePage />} />
      <Route path="/manager/applications" element={<ApplicationsPage manager />} />
      <Route path="/manager" element={<ManagerPage />} />
      <Route path="/manager/users" element={<ManagerPage view="users" />} />
      <Route path="/manager/content" element={<ManagerPage view="content" />} />
      <Route path="/manager/catalog" element={<CatalogPage />} />
      <Route path="/admin/tags" element={<CatalogPage admin />} />
      <Route path="/account" element={<AccountPage />} /><Route path="/account/status" element={<AccountPage status />} /><Route path="/" element={<Navigate to="/questions" replace />} /><Route path="/about" element={<HomePage />} /><Route path="/durum" element={<StatusPage />} /><Route path="*" element={<section className="status-page"><span className="eyebrow">404</span><h1>Bu sayfayı bulamadık.</h1><Link className="button" to="/">Ana sayfaya dön</Link></section>} /></Routes></main>
    <footer className="site-footer"><Link className="brand footer-brand" to="/">tanıdık<span>var</span></Link><Link to="/about">Hakkımızda</Link><Link to="/durum">Sistem durumu ↗</Link></footer>
  </>
}

function HeaderIdentity({userId,role}:{userId:string;role:string}){
 const {profile}=useProfileSummary(userId)
 return <Link className="account-menu-button" to="/account" aria-label="Hesabım"><span className="header-identity"><strong>{[profile?.firstName,profile?.lastName].filter(Boolean).join(' ')||'Üye'}</strong><span>{roleLabels[role]||role}</span></span><span className="account-menu-divider" aria-hidden="true"/><span className="account-menu-label">Hesabım</span></Link>
}
