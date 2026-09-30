"use client";
import {useState} from "react";
import {ModalShell} from "./modal-shell";
export type AchievementDefinition={key:string;title:string;description:string;icon:string};
export type Achievement={id:string;key:string;title:string;periodYear:number|null;awardedAt:string;featured:boolean};
export function AchievementBadge({definition,achievement}:{definition:AchievementDefinition;achievement?:Achievement}){
 const[open,setOpen]=useState(false);
 return <><button type="button" className={`achievement-medallion${achievement?"":" locked"}`} aria-label={`${definition.title}: ${achievement?"kazanıldı":"kilitli"}. Ayrıntıyı aç`} onClick={()=>setOpen(true)}><span aria-hidden="true">{definition.icon}</span></button><ModalShell open={open} onClose={()=>setOpen(false)} title={achievement?.title??definition.title} className="achievement-detail-dialog"><div className="achievement-detail-emblem" aria-hidden="true">{definition.icon}</div><span className={`achievement-detail-status${achievement?"":" is-locked"}`}>{achievement?"Kazanılan rozet":"Kilitli rozet"}</span><p className="achievement-detail-description">{definition.description}</p><p className="achievement-detail-date">{achievement?<>Kazanım tarihi <strong>{new Date(achievement.awardedAt).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}</strong></>:"Bu görevi tamamladığında rozetin kilidi açılır."}</p></ModalShell></>;
}
export function FeaturedAchievements({items,catalog}:{items:Achievement[];catalog:AchievementDefinition[]}){
 return <div className="featured-achievements">{items.filter(item=>item.featured).map(item=><div key={item.id}><AchievementBadge achievement={item} definition={catalog.find(d=>d.key===item.key)??{key:item.key,title:item.title,description:"Topluluğa yaptığın katkılar için kazanılan başarı rozeti.",icon:"★"}}/><span>{item.title}</span></div>)}</div>;
}
