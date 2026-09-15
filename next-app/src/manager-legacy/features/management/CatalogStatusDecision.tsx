import { useCallback } from 'react'
import { getUsage } from './workspaceApi'
import { useManagerData } from './useManagerData'
import { ManagementDecision } from './ManagementDecision'
import { AuthFormError } from '../auth/AuthFormError'
export function CatalogStatusDecision({kind,id,deleted,apply,reload,cancel}:{kind:string;id:string;deleted:boolean;apply:(reason:string)=>Promise<unknown>;reload:()=>void;cancel:()=>void}){
 const loader=useCallback((signal:AbortSignal)=>getUsage(kind,id,signal),[kind,id]),state=useManagerData(loader)
 return <div className="catalog-impact">{state.error?<><AuthFormError error={state.error}/><button onClick={state.reload}>Etkiyi yeniden yükle</button></>:!state.data?<p role="status">Bağlı kayıtlar hesaplanıyor…</p>:<><p><strong>{state.data.profiles} bağlı profil · {state.data.questions} bağlı soru</strong></p><p>Geçmiş bağlantılar korunur. Pasif kayıtlar yeni seçimlere kapanır.</p><ManagementDecision label={deleted?'Kaydı geri aç':'Kaydı pasifleştir'} explanation="Bağlı profil ve sorular silinmez. Bağımsız pasifleştirilmiş alt kayıtlar kendiliğinden açılmaz." apply={apply} reload={reload}/></>}<button type="button" onClick={cancel}>İptal</button></div>
}
