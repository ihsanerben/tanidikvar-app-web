import { useEffect, useState } from 'react'
import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
function parse(v:unknown):string|null{if(!isRecord(v)||!(v.fileId===null||typeof v.fileId==='string'))throw new ApiError(200,'INVALID_RESPONSE','Fotoğraf bilgisi alınamadı.');return v.fileId as string|null}
const base=(import.meta.env.VITE_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'')
export function AvatarEditor(){
 const [id,setId]=useState<string|null>(null),[file,setFile]=useState<File|null>(null),[loaded,setLoaded]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0),[saved,setSaved]=useState(false)
 useEffect(()=>{const c=new AbortController();apiGet('/api/me/avatar',c.signal).then(v=>{if(!c.signal.aborted){setId(parse(v));setLoaded(true)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[revision])
 async function save(remove=false){if(pending)return;setPending(true);setError(null);setSaved(false);try{if(remove){await apiMutation('/api/me/avatar/remove','POST',{});setId(null)}else if(file){if(file.size>5*1024*1024)throw new ApiError(400,'INVALID_FILE','Fotoğraf en fazla 5 MB olabilir.');const data=new FormData();data.append('file',file);setId(parse(await apiMutation('/api/me/avatar','POST',data)))}setSaved(true)}catch(e){setError(formError(e))}finally{setPending(false)}}
 return <section className="auth-card"><h2>Profil fotoğrafı</h2>{id&&<img className="profile-photo" src={base+'/api/avatars/'+encodeURIComponent(id)} alt="Profil fotoğrafın"/>}
 <p>JPEG/PNG · en fazla 5 MB. Fotoğrafın herkese açık olur.</p><AuthFormError error={error}/>
 {!loaded?error?<button className="button" onClick={()=>{setError(null);setRevision(revision+1)}}>Tekrar dene</button>:<p role="status">Fotoğraf yükleniyor…</p>:<form onSubmit={e=>{e.preventDefault();void save()}}><label htmlFor="avatar-file">Fotoğraf seç</label><input id="avatar-file" type="file" accept="image/jpeg,image/png" required disabled={pending} onChange={e=>{setFile(e.target.files?.[0]??null);setSaved(false)}}/><div className="application-actions"><button className="button" disabled={pending||!file}>{pending?'Kaydediliyor…':'Fotoğrafı kaydet'}</button>{id&&<button type="button" className="button button-secondary" disabled={pending} onClick={()=>void save(true)}>Fotoğrafı kaldır</button>}</div></form>}
 {saved&&<p role="status">Fotoğraf güncellendi.</p>}</section>
}

