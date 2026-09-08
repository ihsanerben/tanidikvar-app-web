import { useEffect, useState } from 'react'
import { apiGet, isRecord } from '../../api/apiClient'
import { avatarUrl } from '../adminAnswers/adminAnswerApi'
function adminStarCount(educationStatus?:string|null){return educationStatus==='YKS_ADAYI'?1:educationStatus==='UNIVERSITE_OGRENCISI'?2:3}
export function AdminStars({educationStatus}:{educationStatus?:string|null}){return <>{Array.from({length:adminStarCount(educationStatus)},(_,index)=><span key={index}>★</span>)}</>}
export function ProfileAvatar({fileId,name,className='profile-photo',isAdmin=false,decorated=true,educationStatus}:{fileId?:string|null;name:string;className?:string;isAdmin?:boolean;decorated?:boolean;educationStatus?:string|null}){
 const [failed,setFailed]=useState<string|null>(null)
 const avatar=fileId&&failed!==fileId?<img className={className} src={avatarUrl(fileId)} alt={`${name || 'Kullanıcı'} profil fotoğrafı`} onError={()=>setFailed(fileId)}/>:<span className={`${className} avatar-fallback`} aria-label="Profil baş harfleri">{name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toLocaleUpperCase('tr')||'?'}</span>
 return decorated&&isAdmin?<span className="profile-avatar-motif">{avatar}<span aria-hidden="true"><AdminStars educationStatus={educationStatus}/></span></span>:avatar
}
export function OwnProfileAvatar({name,isAdmin=false,decorated=true,educationStatus}:{name:string;isAdmin?:boolean;decorated?:boolean;educationStatus?:string|null}){
 const [id,setId]=useState<string|null>(null)
 useEffect(()=>{
  const controller=new AbortController()
  const update=(event:Event)=>{controller.abort();setId((event as CustomEvent<string|null>).detail)}
  window.addEventListener('avatar:updated',update)
  apiGet('/api/me/avatar',controller.signal).then(value=>{if(!controller.signal.aborted&&isRecord(value)&&(value.fileId===null||typeof value.fileId==='string'))setId(value.fileId)}).catch(()=>{/* Initials remain available if the photo cannot load. */})
  return()=>{controller.abort();window.removeEventListener('avatar:updated',update)}
 },[])
 return <ProfileAvatar fileId={id} name={name} isAdmin={isAdmin} decorated={decorated} educationStatus={educationStatus}/>
}
