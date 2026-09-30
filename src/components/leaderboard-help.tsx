"use client";
import {useState} from "react";
import {ModalShell} from "@/components/modal-shell";
export function LeaderboardHelp(){const[open,setOpen]=useState(false);return <><button className="leaderboard-help-button" type="button" aria-label="Puan sistemi nasıl çalışıyor?" onClick={()=>setOpen(true)}>?</button><ModalShell open={open} onClose={()=>setOpen(false)} title="Puanlar nasıl toplanıyor?" className="ui-help-modal"><p>Yalnız yayında kalan, özgün katkılar puana dönüşür.</p><dl>{[["Soru sormak","10 puan"],["Yorum yazmak","5 puan"],["Deneyim paylaşmak","3 puan"],["Anket açmak","3 puan"],["Ankete katılmak","1 puan"],["Değerlendirme yapmak","1 puan"],["Ölçüm paylaşmak","1 puan"]].map(([name,point])=><div key={name}><dt>{name}</dt><dd>{point}</dd></div>)}</dl></ModalShell></>}
