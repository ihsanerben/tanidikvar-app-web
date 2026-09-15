"use client";
import {useState} from "react";
import {ModalShell} from "@/components/modal-shell";
export function LeaderboardHelp(){const[open,setOpen]=useState(false);return <><button className="leaderboard-help-button" type="button" aria-label="Puan sistemi nasıl çalışıyor?" onClick={()=>setOpen(true)}>?</button><ModalShell open={open} onClose={()=>setOpen(false)} title="Puanlar nasıl toplanıyor?" className="ui-help-modal"><p>Yalnız yayında kalan, özgün katkılar puana dönüşür.</p><dl>{[["Soru sormak","5 puan"],["Yorum yazmak","10 puan"],["Faydalı oyu almak","3 puan"],["En iyi cevap seçilmek","15 puan"],["Deneyim paylaşmak","12 puan"],["Değerlendirme yapmak","8 puan"]].map(([name,point])=><div key={name}><dt>{name}</dt><dd>{point}</dd></div>)}</dl></ModalShell></>}
