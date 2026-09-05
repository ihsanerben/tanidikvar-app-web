import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../../api/apiClient'
import { AuthFormError } from '../auth/AuthFormError'
import { formError } from '../auth/formError'
import { createEntry, getCatalog, renameEntry, setEntryStatus, type CatalogEntry, type Kind, type Page } from './catalogApi'

export function CatalogEditor({kind,admin=false}:{kind:Kind;admin?:boolean}){
  const [name,setName]=useState('')
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(0)
  const [includeDeleted,setIncludeDeleted]=useState(false)
  const [result,setResult]=useState<Page<CatalogEntry>|null>(null)
  const [error,setError]=useState<ApiError|null>(null)
  const [loading,setLoading]=useState(true)
  const [pending,setPending]=useState(false)
  const [revision,setRevision]=useState(0)
  const [notice,setNotice]=useState('')
  const [editing,setEditing]=useState<CatalogEntry|null>(null)
  const [editName,setEditName]=useState('')
  const busy=useRef(false)
  useEffect(()=>{
    const controller=new AbortController()
    const endpoint=admin?'/api/tags':`/api/manager/catalog/${kind}`
    getCatalog(`${endpoint}?q=${encodeURIComponent(query)}&page=${page}&size=20&includeDeleted=${includeDeleted}`,controller.signal)
      .then(data=>{if(!controller.signal.aborted){setResult(data);setLoading(false)}})
      .catch(reason=>{if(!controller.signal.aborted){setError(formError(reason));setLoading(false)}})
    return ()=>controller.abort()
  },[kind,admin,query,page,includeDeleted,revision])
  function refresh(){setLoading(true);setError(null);setRevision(revision+1)}
  async function mutate(action:()=>Promise<unknown>,message:string){
    if(busy.current)return
    busy.current=true;setPending(true);setError(null);setNotice('')
    try{await action();setNotice(message);setEditing(null);refresh()}
    catch(reason){setError(formError(reason))}
    finally{busy.current=false;setPending(false)}
  }
  function create(event:FormEvent){event.preventDefault();void mutate(async()=>{await createEntry(kind,name,admin);setName('')},'Kayıt eklendi.')}
  return <div className="catalog-editor"><form className="inline-form" onSubmit={create}>
    <label htmlFor="catalog-name">Yeni kayıt adı</label><input id="catalog-name" value={name} onChange={e=>setName(e.target.value)} required maxLength={200} disabled={pending}/>
    <button className="button" disabled={pending}>Ekle</button>
  </form>
  <div className="catalog-filters"><label htmlFor="catalog-search">Listede ara</label><input id="catalog-search" type="search" maxLength={100} value={query} onChange={e=>{setQuery(e.target.value);setPage(0);setLoading(true)}}/>
    {!admin && <label className="checkbox-label"><input type="checkbox" checked={includeDeleted} onChange={e=>{setIncludeDeleted(e.target.checked);setPage(0);setLoading(true)}}/>Pasif kayıtları göster</label>}
  </div>
  <AuthFormError error={error}/>{error && <button type="button" onClick={refresh}>Listeyi yenile</button>}
  {notice && <p className="success-notice" role="status">{notice}</p>}
  {loading?<p role="status">Liste yükleniyor…</p>:result?.items.length===0?<p className="empty-state">Henüz kayıt yok. Yeni bir kayıt ekleyebilirsin.</p>:
    <ul className="catalog-list">{result?.items.map(entry=><li key={entry.id}>
      {editing?.id===entry.id?<form className="inline-form" onSubmit={event=>{event.preventDefault();void mutate(()=>renameEntry(kind,entry,editName),'Ad güncellendi.')}}>
        <label htmlFor="edit-name">Yeni ad</label><input id="edit-name" value={editName} onChange={e=>setEditName(e.target.value)} required maxLength={200}/>
        <button className="button" disabled={pending}>Kaydet</button><button type="button" onClick={()=>setEditing(null)}>Vazgeç</button>
      </form>:<><span className="catalog-name">{entry.name}<small>{entry.deletedAt?'Pasif':'Aktif'}</small></span>
        {!admin && <div className="row-actions"><button type="button" disabled={pending} onClick={()=>{setEditing(entry);setEditName(entry.name)}}>Düzenle</button>
          <button type="button" disabled={pending} onClick={()=>void mutate(()=>setEntryStatus(kind,entry),entry.deletedAt?'Kayıt geri yüklendi.':'Kayıt pasife alındı.')}>{entry.deletedAt?'Geri yükle':'Pasife al'}</button></div>}</>}
    </li>)}</ul>}
  {result && <div className="pagination"><button type="button" disabled={page===0 || loading} onClick={()=>{setPage(page-1);setLoading(true)}}>Önceki sayfa</button>
    <span>{result.totalElements} kayıt · Sayfa {page+1}</span><button type="button" disabled={(page+1)*result.size>=result.totalElements || loading} onClick={()=>{setPage(page+1);setLoading(true)}}>Sonraki sayfa</button></div>}
  </div>
}
