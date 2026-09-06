import { useEffect, useRef, useState } from 'react'
import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
function parse(v:unknown):string|null{if(!isRecord(v)||!(v.fileId===null||typeof v.fileId==='string'))throw new ApiError(200,'INVALID_RESPONSE','Fotoğraf bilgisi alınamadı.');return v.fileId as string|null}
const base=(import.meta.env.VITE_API_BASE_URL||'http://localhost:8080').replace(/\/$/,'')
export function AvatarEditor(){
 const [id,setId]=useState<string|null>(null),[file,setFile]=useState<File|null>(null),[preview,setPreview]=useState<string|null>(null),[loaded,setLoaded]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState<ApiError|null>(null),[revision,setRevision]=useState(0),[saved,setSaved]=useState(false)
 const busy=useRef(false),input=useRef<HTMLInputElement>(null),previewUrl=useRef<string|null>(null)
 useEffect(()=>{const c=new AbortController();apiGet('/api/me/avatar',c.signal).then(v=>{if(!c.signal.aborted){setId(parse(v));setLoaded(true)}}).catch(e=>{if(!c.signal.aborted)setError(formError(e))});return()=>c.abort()},[revision])
 useEffect(()=>()=>{if(previewUrl.current)URL.revokeObjectURL(previewUrl.current)},[])
 function clearPreview(){if(previewUrl.current)URL.revokeObjectURL(previewUrl.current);previewUrl.current=null;setPreview(null)}
 function choose(selected:File|null){
  setSaved(false);setError(null);clearPreview();setFile(null)
  if(!selected)return
  if(!(['image/jpeg','image/png'].includes(selected.type)||(!selected.type&&/\.(jpe?g|png)$/i.test(selected.name)))||selected.size===0||selected.size>5*1024*1024){setError(new ApiError(400,'INVALID_FILE','JPEG veya PNG biçiminde, en fazla 5 MB bir fotoğraf seç.'));if(input.current)input.current.value='';return}
  setFile(selected);previewUrl.current=URL.createObjectURL(selected);setPreview(previewUrl.current)
 }
 async function save(remove=false){
  if(busy.current)return
  const selected=input.current?.files?.[0]??file
  if(!remove&&!selected){setError(new ApiError(400,'FILE_REQUIRED','Önce bir fotoğraf seç.'));input.current?.focus();return}
  busy.current=true;setPending(true);setError(null);setSaved(false)
  try{
   if(remove){await apiMutation('/api/me/avatar/remove','POST',{});setId(null);window.dispatchEvent(new CustomEvent('avatar:updated',{detail:null}))}
   else{const data=new FormData();data.append('file',selected!);const nextId=parse(await apiMutation('/api/me/avatar','POST',data));setId(nextId);window.dispatchEvent(new CustomEvent('avatar:updated',{detail:nextId}))}
   setFile(null);clearPreview();if(input.current)input.current.value='';setSaved(true)
  }catch(e){setError(formError(e))}finally{busy.current=false;setPending(false)}
 }
 return <section className="auth-card avatar-editor"><h2>Profil fotoğrafı</h2>
 <div className="avatar-preview">{preview?<img className="profile-photo" src={preview} alt="Seçilen fotoğrafın önizlemesi"/>:id?<img className="profile-photo" src={base+'/api/avatars/'+encodeURIComponent(id)} alt="Profil fotoğrafın"/>:null}</div>
 <AuthFormError error={error}/>
 {!loaded?error?<button className="button" onClick={()=>{setError(null);setRevision(r=>r+1)}}>Tekrar dene</button>:<p role="status">Fotoğraf yükleniyor…</p>:<form noValidate onSubmit={e=>{e.preventDefault();void save()}}>
 <label htmlFor="avatar-file">Fotoğraf seç</label><input ref={input} id="avatar-file" type="file" accept="image/jpeg,image/png" disabled={pending} onChange={e=>choose(e.target.files?.[0]??null)}/>
 <div className="application-actions"><button type="submit" className="button" disabled={pending} aria-busy={pending}>{pending?'Kaydediliyor…':'Fotoğrafı kaydet'}</button>{id&&<button type="button" className="button button-secondary" disabled={pending} onClick={()=>void save(true)}>Fotoğrafı kaldır</button>}</div></form>}
 {saved&&<p role="status">Fotoğraf güncellendi.</p>}</section>
}
