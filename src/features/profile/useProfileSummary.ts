import { useEffect,useState } from 'react'
import { getProfile,type Profile } from './profileApi'
import { formError } from '../auth/formError'
import type { ApiError } from '../../api/apiClient'
export function useProfileSummary(userId?:string){
 const [profile,setProfile]=useState<Profile|null>(null),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0)
 useEffect(()=>{const update=()=>setRevision(r=>r+1);window.addEventListener('profile:updated',update);return()=>window.removeEventListener('profile:updated',update)},[])
 useEffect(()=>{if(!userId)return;const c=new AbortController();getProfile(c.signal).then(p=>{if(!c.signal.aborted){setProfile(p);setError(null)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[userId,revision])
 return {profile,error,reload:()=>setRevision(r=>r+1)}
}
export const roleLabels:Record<string,string>={USER:'Yeni üye',YKS_ADAYI:'YKS Adayı',UNIVERSITE_OGRENCISI:'Üniversite Öğrencisi',MEZUN:'Mezun',ADMIN:'Admin',MANAGER:'Manager'}
