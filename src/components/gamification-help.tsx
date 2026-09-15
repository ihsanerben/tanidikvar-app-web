"use client";

import { useState } from "react";
import {ModalShell} from "@/components/modal-shell";

export function GamificationHelp() {
  const [open, setOpen] = useState(false);
  return <>
    <button className="gamification-help-button" type="button" aria-label="Katkı seviyesi nasıl hesaplanır?" aria-expanded={open} onClick={() => setOpen(true)}>?</button>
    <ModalShell open={open} onClose={()=>setOpen(false)} title="Katkı seviyesi" className="ui-help-modal"><p>Katkı seviyesi, kişinin platformdaki faydalı ve doğrulanmış katkılarından oluşur. Amaç yalnızca çok içerik üretmek değil, topluluğa gerçekten yardımcı olmaktır.</p><dl><div><dt>Faydalı oy</dt><dd>Kalite etkisi</dd></div><div><dt>En iyi cevap</dt><dd>Güven etkisi</dd></div><div><dt>Yorum ve deneyim</dt><dd>Katılım etkisi</dd></div><div><dt>Rozetler</dt><dd>Başarı alanları</dd></div></dl></ModalShell>
  </>;
}
