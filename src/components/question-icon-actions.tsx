"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";
import { AnswerForm } from "@/components/answer-form";
import {ModalShell} from "@/components/modal-shell";
import {Button} from "@/components/ui";

function ShareIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-8.5 18-2.2-7.3L3 11.5 21 3Z"/><path d="m10.3 13.7 4.5-4.5"/></svg>; }
function SaveIcon({ filled }: { filled: boolean }) { return <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? "filled" : ""}><path d="M6 3.5h12v17l-6-4-6 4v-17Z"/></svg>; }
function ReportIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4"/><path d="M6 5h11l-2 4 2 4H6"/></svg>;}
function HeartIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z"/></svg>}
function MoreIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>}
function CommentIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v12H9l-5 4v-16Z"/></svg>}

export function QuestionIconActions({questionId,title,initialLikeCount,answerCount,canAnswer,tanidik=false}:{questionId:string;title:string;initialLikeCount:number;answerCount:number;canAnswer:boolean;tanidik?:boolean}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [liked,setLiked]=useState(false),[likeCount,setLikeCount]=useState(initialLikeCount),[likeVersion,setLikeVersion]=useState(0);
  const [message, setMessage] = useState("");
  const [menuOpen,setMenuOpen]=useState(false);
  const [composerOpen,setComposerOpen]=useState(false);
  const [reportOpen,setReportOpen]=useState(false),[reportReason,setReportReason]=useState(""),[reportBusy,setReportBusy]=useState(false);
  const menuRef=useRef<HTMLSpanElement>(null);
  useEffect(()=>{if(!menuOpen)return;function close(event:PointerEvent){if(!menuRef.current?.contains(event.target as Node))setMenuOpen(false);}document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close);},[menuOpen]);
  useEffect(()=>{apiRequest<{liked:boolean;version:number}>(`/questions/${questionId}/like`).then(value=>{setLiked(value.liked);setLikeVersion(value.version);}).catch(()=>undefined);},[questionId]);
  async function share() {
    setMenuOpen(false);
    const data = { title, text: `${title} · TanıdıkVar`, url: location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else { await navigator.clipboard.writeText(location.href); setMessage("Bağlantı kopyalandı."); }
  }
  async function save() {
    setMenuOpen(false);
    setMessage("");
    try {
      await apiRequest("/me/saved", { method: "PUT", body: JSON.stringify({ targetType: "QUESTION", targetId: questionId, active: !saved }) });
      setSaved(!saved);
      setMessage(saved ? "Kayıttan çıkarıldı." : "Soru kaydedildi.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "İşlem tamamlanamadı.";
      if (/oturum|giriş|kimlik/i.test(text)) { if (window.confirm("Bu işlem için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?")) router.push("/giris"); } else setMessage(text);
    }
  }
  async function report(){
    setMenuOpen(false);
    if(reportReason.trim().length<10)return;
    setReportBusy(true);
    setMessage("");
    try{await apiRequest(`/questions/${questionId}/reports`,{method:"POST",body:JSON.stringify({reason:reportReason.trim()})});setMessage("Şikâyetiniz incelemeye gönderildi.");setReportOpen(false);setReportReason("");}
    catch(error){const text=error instanceof Error?error.message:"Şikâyet gönderilemedi.";if(/oturum|giriş|kimlik/i.test(text)){if(window.confirm("Bu işlem için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?"))router.push("/giris");}else setMessage(text);}finally{setReportBusy(false);}
  }
  async function like(){const next=!liked;setLiked(next);setLikeCount(value=>Math.max(0,value+(next?1:-1)));try{const value=await apiRequest<{liked:boolean;version:number}>(`/questions/${questionId}/like`,{method:"PUT",body:JSON.stringify({liked:next,version:likeVersion})});setLiked(value.liked);setLikeVersion(value.version);}catch(error){setLiked(!next);setLikeCount(value=>Math.max(0,value+(next?-1:1)));const text=error instanceof Error?error.message:"İşlem tamamlanamadı.";if(/oturum|giriş|kimlik/i.test(text)){if(window.confirm("Bu işlem için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?"))router.push("/giris");}else setMessage(text);}}
  function openComposer(){if(!canAnswer){if(window.confirm("Yorum yazmak için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?"))router.push("/giris");return;}setComposerOpen(true);}
  return <div className="legacy-question-icon-actions">
    <button type="button" className={`legacy-question-like${liked?" is-liked":""}`} onClick={()=>void like()} aria-pressed={liked} aria-label={`${likeCount} beğeni`} title="Beğen"><HeartIcon/><span>{likeCount}</span></button>
    <button type="button" className="legacy-question-comment" onClick={openComposer} aria-label={`${answerCount} yorum, yorum yaz`} title="Yorum yaz"><CommentIcon/><span>{answerCount}</span></button>
    <span className="legacy-question-more" ref={menuRef}>
      <button type="button" className="legacy-question-more-trigger" onClick={()=>setMenuOpen(open=>!open)} aria-expanded={menuOpen} aria-haspopup="menu" aria-label="Diğer işlemler" title="Diğer işlemler"><MoreIcon/></button>
      {menuOpen&&<span className="legacy-question-action-menu" role="menu">
        <button type="button" role="menuitem" onClick={() => void share()}><ShareIcon/><span>Paylaş</span></button>
        <button type="button" role="menuitem" onClick={() => void save()}><SaveIcon filled={saved}/><span>{saved?"Kayıttan çıkar":"Kaydet"}</span></button>
        <button type="button" role="menuitem" onClick={()=>{setMenuOpen(false);setReportOpen(true);}}><ReportIcon/><span>Şikâyet et</span></button>
      </span>}
    </span>
    <ModalShell open={composerOpen} onClose={()=>setComposerOpen(false)} title="Yorumunu yaz"><AnswerForm questionId={questionId} tanidik={tanidik} onSuccess={()=>setComposerOpen(false)}/></ModalShell>
    <ModalShell open={reportOpen} onClose={()=>setReportOpen(false)} title="Soruyu şikâyet et" className="question-report-dialog"><form onSubmit={event=>{event.preventDefault();void report();}}><p>Topluluk kurallarına aykırı olduğunu düşündüğün noktayı açıkla.</p><label htmlFor={`report-${questionId}`}>Şikâyet nedeni</label><textarea id={`report-${questionId}`} required minLength={10} maxLength={1000} rows={5} value={reportReason} onChange={event=>setReportReason(event.target.value)} placeholder="Şikâyet nedenini kısaca açıkla."/><small>10–1000 karakter · {reportReason.length}/1000</small><div className="question-report-actions"><Button disabled={reportBusy||reportReason.trim().length<10}>{reportBusy?"Gönderiliyor…":"Şikâyeti gönder"}</Button><Button tone="secondary" type="button" onClick={()=>setReportOpen(false)}>Vazgeç</Button></div></form></ModalShell>
    {message && <span className="sr-only" role="status">{message}</span>}
  </div>;
}
