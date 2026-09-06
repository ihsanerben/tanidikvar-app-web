import { useRef,useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
import { AvatarEditor } from '../profile/AvatarEditor'
import { OwnProfileAvatar } from '../profile/ProfileAvatar'
import { getManagerAccount,saveManagerAccount,type ManagerAccount } from './workspaceApi'
import { useManagerData } from './useManagerData'
export function ManagerAccountPage(){const state=useManagerData(getManagerAccount);return <section className="management-page"><h1>Hesabım</h1>{state.error?<><AuthFormError error={state.error}/><button onClick={state.reload}>Tekrar dene</button></>:!state.data?<p role="status">Hesap yükleniyor…</p>:<ManagerAccountForm key={state.data.version} initial={state.data} reload={state.reload}/>}</section>}
function ManagerAccountForm({initial,reload}:{initial:ManagerAccount;reload:()=>void}){
 const auth=useAuth(),[account,setAccount]=useState(initial),[error,setError]=useState<ApiError|null>(null),[pending,setPending]=useState(false),[saved,setSaved]=useState(false),busy=useRef(false)
 async function save(){if(busy.current)return;busy.current=true;setPending(true);setError(null);setSaved(false);try{setAccount(await saveManagerAccount(account));setSaved(true)}catch(e){setError(formError(e))}finally{busy.current=false;setPending(false)}}
 return <div className="manager-account-grid"><div><form className="auth-card" onSubmit={e=>{e.preventDefault();void save()}}><OwnProfileAvatar name={`${account.firstName??''} ${account.lastName??''}`}/><h2>Yönetim kimliği</h2><label htmlFor="manager-first-name">Ad</label><input id="manager-first-name" autoComplete="given-name" required maxLength={80} disabled={pending} value={account.firstName??''} onChange={e=>{setAccount({...account,firstName:e.target.value});setSaved(false)}}/><label htmlFor="manager-last-name">Soyad</label><input id="manager-last-name" autoComplete="family-name" required maxLength={80} disabled={pending} value={account.lastName??''} onChange={e=>{setAccount({...account,lastName:e.target.value});setSaved(false)}}/><p>E-posta: <strong>{account.email}</strong></p><AuthFormError error={error}/>{error?.code==='STALE_VERSION'?<button type="button" onClick={reload}>Güncel bilgileri yükle</button>:<button className="button" disabled={pending}>{pending?'Kaydediliyor…':'Bilgilerimi kaydet'}</button>}{saved&&<p role="status">Bilgilerin kaydedildi.</p>}</form><section className="auth-card"><h2>Hesap güvenliği</h2><p>E-posta adresin doğrulanmış.</p><Link className="button button-secondary" to="/forgot-password">Şifre yenileme bağlantısı iste</Link><button className="button button-danger" disabled={pending} onClick={()=>{setPending(true);void auth.logout().catch(e=>{setError(formError(e));setPending(false)})}}>Çıkış yap</button></section></div><AvatarEditor/></div>
}
