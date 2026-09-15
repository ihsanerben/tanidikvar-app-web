import { useEffect,useState } from 'react'
import type { ApiError } from '../../api/apiClient'
import { formError } from '../auth/formError'
export function useManagerData<T>(loader:(signal:AbortSignal)=>Promise<T>){
 const [revision,setRevision]=useState(0)
 const [result,setResult]=useState<{loader:typeof loader;revision:number;data:T|null;error:ApiError|null}|null>(null)
 useEffect(()=>{const c=new AbortController();loader(c.signal).then(data=>{if(!c.signal.aborted)setResult({loader,revision,data,error:null})}).catch(e=>{if(!c.signal.aborted)setResult({loader,revision,data:null,error:formError(e)})});return()=>c.abort()},[loader,revision])
 const current=result?.loader===loader&&result.revision===revision?result:null
 return {data:current?.data??null,error:current?.error??null,reload:()=>setRevision(r=>r+1)}
}
