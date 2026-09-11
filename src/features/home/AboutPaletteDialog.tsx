import { useEffect,useRef } from 'react'
import { ProfileAvatar } from '../profile/ProfileAvatar'

export function AboutPaletteDialog({onClose}:{onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null)
 useEffect(()=>{const current=dialog.current;current?.showModal();return()=>current?.close()},[])
 return <dialog ref={dialog} className="about-palette-dialog" aria-labelledby="about-palette-title" onClose={onClose}>
  <button type="button" className="profile-close" aria-label="Rehberi kapat" onClick={()=>dialog.current?.close()}>×</button>
  <h2 id="about-palette-title">Renkler ne anlatıyor?</h2>
  <section aria-labelledby="about-role-title"><h3 id="about-role-title">1 — Kullanıcı rolleri</h3><div className="about-role-grid">
   <div><ProfileAvatar name="YA" educationStatus="YKS_ADAYI"/><span>YKS adayı<br/><b className="about-role-color role-blue">(Mavi)</b></span></div>
   <div><ProfileAvatar name="ÜÖ" educationStatus="UNIVERSITE_OGRENCISI"/><span>Üniversite öğrencisi<br/><b className="about-role-color role-green">(Yeşil)</b></span></div>
   <div><ProfileAvatar name="M" educationStatus="MEZUN"/><span>Mezun<br/><b className="about-role-color role-red">(Kırmızı)</b></span></div>
  </div></section>
  <section aria-labelledby="about-scope-title"><h3 id="about-scope-title">2 — Soru kapsamı</h3><div className="about-scope-list">
   <span className="scope-badge scope-general">Genel</span><span className="scope-badge scope-university">Üniversite</span><span className="scope-badge scope-university_department">Üniversite + Bölüm</span>
  </div></section>
  <section className="about-admin-section" aria-labelledby="about-admin-title"><h3 id="about-admin-title">3 — Admin rozeti</h3><div className="about-admin-guide"><ProfileAvatar name="M" isAdmin educationStatus="MEZUN"/><p>Altın çerçeve ve yıldızlar, sistemdeki Admin gösterimidir.</p></div></section>
  <button type="button" className="button about-palette-dismiss" onClick={()=>dialog.current?.close()}>Anladım, devam et</button>
 </dialog>
}
