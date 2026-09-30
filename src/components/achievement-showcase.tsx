"use client";
import {useCallback,useEffect,useState} from "react";
import {apiRequest} from "@/lib/client-api";
import {AchievementBadge,type Achievement,type AchievementDefinition} from "./achievement-badge";
import {groupAchievementEntries} from "./achievement-groups";
export function AchievementShowcase({userId}:{userId:string}){
 const[items,setItems]=useState<Achievement[]>([]),[catalog,setCatalog]=useState<AchievementDefinition[]>([]),[selected,setSelected]=useState<string[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);setError("");try{const[earned,definitions]=await Promise.all([apiRequest<Achievement[]>(`/gamification/profiles/${userId}/achievements`),apiRequest<AchievementDefinition[]>("/gamification/achievements")]);setItems(earned);setCatalog(definitions);setSelected(earned.filter(a=>a.featured).map(a=>a.id));}catch{setError("Rozetler yüklenemedi.");}finally{setLoading(false);}},[userId]);
 useEffect(()=>{void load();},[load]);
 async function save(){setBusy(true);setError("");setMessage("");try{const result=await apiRequest<Achievement[]>("/me/gamification/showcase",{method:"PUT",body:JSON.stringify({achievementIds:selected})});setItems(result);setMessage("Profil vitrinin güncellendi.");}catch(reason){setError(reason instanceof Error?reason.message:"Rozet seçimi kaydedilemedi.");}finally{setBusy(false);}}
 if(loading)return <p role="status">Rozetler yükleniyor…</p>;
 if(!catalog.length&&error)return <div role="alert"><p>{error}</p><button className="button secondary" onClick={()=>void load()}>Tekrar dene</button></div>;
 const entries=catalog.flatMap<{definition:AchievementDefinition;achievement:Achievement|undefined}>(definition=>{const earned=items.filter(a=>a.key===definition.key);return earned.length?earned.map(achievement=>({definition,achievement})): [{definition,achievement:undefined}];});
 for(const achievement of items.filter(a=>!catalog.some(d=>d.key===a.key)))entries.push({achievement,definition:{key:achievement.key,title:achievement.title,description:"Topluluğa yaptığın katkılar için kazanılan başarı rozeti.",icon:"★"}});
 return <section>
  <div className="achievement-showcase-toolbar">
   <div className="achievement-summary"><div><strong>{items.length}</strong><span>kazanılan rozet</span></div><div><strong>{selected.length}/3</strong><span>profilinde gösterilecek</span></div></div>
   <div className="achievement-save"><button className="button" disabled={busy} onClick={()=>void save()}>{busy?"Kaydediliyor…":"Vitrini kaydet"}</button>{message&&<p role="status">{message}</p>}{error&&<p role="alert">{error}</p>}</div>
  </div>
  <p>Görevleri tamamla, rozetlerin kilidini aç. Kazandığın rozetlerden en fazla üçünü profilinde göster. Ayrıntılar için rozete dokun.</p>
  <div className="achievement-groups">{groupAchievementEntries(entries).map(group => <section className="achievement-group" key={group.title}>
   <h2>{group.title}</h2>
   <div className="achievement-group-grid">{group.items.map(({definition,achievement}) => <article className={`achievement-tile${achievement ? "" : " locked"}`} key={achievement?.id ?? definition.key}>
    <AchievementBadge definition={definition} achievement={achievement}/><h3>{achievement?.title ?? definition.title}</h3><p>{definition.description}</p>
    {achievement ? <label className="checkbox-row"><input type="checkbox" checked={selected.includes(achievement.id)} disabled={busy || (!selected.includes(achievement.id) && selected.length >= 3)} onChange={() => {setMessage("");setSelected(ids => ids.includes(achievement.id) ? ids.filter(id => id !== achievement.id) : [...ids, achievement.id]);}}/>Profilimde göster</label> : <span className="muted">Kilitli</span>}
   </article>)}</div>
  </section>)}</div>
 </section>;
}
