import { useEffect, useState } from 'react'
import { apiGet, isRecord } from '../../api/apiClient'
import { avatarUrl } from '../adminAnswers/adminAnswerApi'
export function ProfileAvatar({fileId,name,className='profile-photo'}:{fileId?:string|null;name:string;className?:string}){
 const [failed,setFailed]=useState<string|null>(null)
 return fileId&&failed!==fileId?<img className={className} src={avatarUrl(fileId)} alt={`${name || 'Kullanıcı'} profil fotoğrafı`} onError={()=>setFailed(fileId)}/>:<span className={`${className} avatar-fallback`} aria-label="Profil baş harfleri">{name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toLocaleUpperCase('tr')||'?'}</span>
}
export function OwnProfileAvatar({name}:{name:string}){
 const [id,setId]=useState<string|null>(null)
 useEffect(()=>{
  const controller=new AbortController()
  const update=(event:Event)=>{controller.abort();setId((event as CustomEvent<string|null>).detail)}
  window.addEventListener('avatar:updated',update)
  apiGet('/api/me/avatar',controller.signal).then(value=>{if(!controller.signal.aborted&&isRecord(value)&&(value.fileId===null||typeof value.fileId==='string'))setId(value.fileId)}).catch(()=>{/* Initials remain available if the photo cannot load. */})
  return()=>{controller.abort();window.removeEventListener('avatar:updated',update)}
 },[])
 return <ProfileAvatar fileId={id} name={name}/>
}
