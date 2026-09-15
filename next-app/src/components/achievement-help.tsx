"use client";

import { useState } from "react";
import {ModalShell} from "@/components/modal-shell";

export function AchievementHelp(){
  const[open,setOpen]=useState(false);
  return <><button className="achievement-help-button" type="button" aria-label="Rozet vitrini nedir?" aria-expanded={open} onClick={()=>setOpen(true)}>?</button><ModalShell open={open} onClose={()=>setOpen(false)} title="Rozet vitrini" className="ui-help-modal"><p>Rozetler, platformdaki faydalı katkıların ve belirli alanlardaki başarıların sonucunda kazanılır. Kazandığın rozetlerden en fazla üçünü seçerek Tanıdık profilinde öne çıkarabilirsin.</p></ModalShell></>;
}
