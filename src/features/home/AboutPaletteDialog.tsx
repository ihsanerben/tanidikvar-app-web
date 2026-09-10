import { useEffect,useRef } from 'react'
import { ProfileAvatar } from '../profile/ProfileAvatar'

export function AboutPaletteDialog({onClose}:{onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null)
 useEffect(()=>{const current=dialog.current;current?.showModal();return()=>current?.close()},[])
 return <dialog ref={dialog} className="about-palette-dialog" aria-labelledby="about-palette-title" onClose={onClose}>
  <button type="button" className="profile-close" aria-label="Rehberi kapat" onClick={()=>dialog.current?.close()}>×</button>
  <h2 id="about-palette-title">Renkler ne anlatıyor?</h2>
  <section aria-labelledby="about-role-title"><h3 id="about-role-title">Kullanıcı rolleri</h3><div className="about-role-grid">
   <div><ProfileAvatar name="YA" educationStatus="YKS_ADAYI"/><span>YKS adayı<br/>(Mavi)</span></div>
   <div><ProfileAvatar name="ÜÖ" educationStatus="UNIVERSITE_OGRENCISI"/><span>Üniversite öğrencisi<br/>(Yeşil)</span></div>
   <div><ProfileAvatar name="M" educationStatus="MEZUN"/><span>Mezun<br/>(Kırmızı)</span></div>
  </div></section>
  <section aria-labelledby="about-scope-title"><h3 id="about-scope-title">Soru kapsamları</h3><div className="about-scope-list">
   <span className="scope-badge scope-general">Genel</span><span className="scope-badge scope-university">Üniversite</span><span className="scope-badge scope-university_department">Üniversite + Bölüm</span>
  </div></section>
  <section className="about-admin-guide" aria-labelledby="about-admin-title"><ProfileAvatar name="M" isAdmin educationStatus="MEZUN"/><div><h3 id="about-admin-title">Admin rozeti</h3><p>Altın çerçeve ve yıldızlar, sistemdeki Admin gösterimidir.</p></div></section>
  <button type="button" className="button about-palette-dismiss" onClick={()=>dialog.current?.close()}>Anladım, devam et</button>
 </dialog>
}
