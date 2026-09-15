"use client";

import {useEffect,useRef,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {apiRequest} from "@/lib/client-api";
import type {AnswerComment} from "@/lib/api/answers";

function MoreIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>}
function ShareIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-8.5 18-2.2-7.3L3 11.5 21 3Z"/><path d="m10.3 13.7 4.5-4.5"/></svg>}
function BestIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>}

type Props={answerId:string;questionId:string;answerAuthor:string;canSelectBest:boolean;initialComments:AnswerComment[]};

export function AnswerActions({answerId,questionId,answerAuthor,canSelectBest,initialComments}:Props){
  const router=useRouter();
  const [comments,setComments]=useState(initialComments),[body,setBody]=useState(""),[replyTo,setReplyTo]=useState<{id:string;name:string}|null>(null);
  const [menuOpen,setMenuOpen]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const menuRef=useRef<HTMLDivElement>(null),inputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{if(!menuOpen)return;function close(event:PointerEvent){if(!menuRef.current?.contains(event.target as Node))setMenuOpen(false);}document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close);},[menuOpen]);

  function failed(reason:unknown,fallback:string){const text=reason instanceof Error?reason.message:fallback;if(/oturum|giriş|kimlik/i.test(text)){if(window.confirm("Bu işlem için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?"))router.push("/giris");return;}setMessage(text);}
  async function action(path:string,bodyValue:unknown){setMenuOpen(false);try{await apiRequest(path,{method:"PUT",body:JSON.stringify(bodyValue)});setMessage("İşlem tamamlandı.");router.refresh();}catch(reason){failed(reason,"İşlem tamamlanamadı.");}}
  async function share(){setMenuOpen(false);const data={title:`${answerAuthor} kullanıcısının yanıtı`,url:location.href};if(navigator.share)await navigator.share(data).catch(()=>undefined);else{await navigator.clipboard.writeText(location.href);setMessage("Bağlantı kopyalandı.");}}
  function reply(id:string,name:string){setReplyTo({id,name});setBody("");requestAnimationFrame(()=>inputRef.current?.focus());}
  async function comment(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setMessage("");const text=replyTo?`@${replyTo.name} ${body.trim()}`:body.trim();try{const created=await apiRequest<AnswerComment>(`/answers/${answerId}/comments`,{method:"POST",body:JSON.stringify({body:text})});setComments(items=>[...items,created]);setBody("");setReplyTo(null);}catch(reason){failed(reason,"Yanıt gönderilemedi.");}finally{setBusy(false);}}
  const format=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));

  return <>
    <div className="legacy-answer-menu" ref={menuRef}>
      <button className="legacy-answer-menu-trigger" type="button" onClick={()=>setMenuOpen(open=>!open)} aria-expanded={menuOpen} aria-haspopup="menu" aria-label="Yanıt işlemleri" title="Yanıt işlemleri"><MoreIcon/></button>
      {menuOpen&&<div className="legacy-answer-menu-popover" role="menu">
        <button type="button" role="menuitem" onClick={()=>void share()}><ShareIcon/><span>Paylaş</span></button>
        {canSelectBest&&<button type="button" role="menuitem" onClick={()=>void action(`/questions/${questionId}/best-answer`,{answerId})}><BestIcon/><span>En iyi cevap seç</span></button>}
      </div>}
    </div>
    <div className="legacy-answer-discussion">
      {comments.length>0&&<ol className="legacy-answer-comments">
        {comments.map(item=><li className={item.body.startsWith("@")?"is-reply":undefined} key={item.id}><p><strong>{item.authorName}</strong> {item.body}</p><div><time dateTime={item.createdAt}>{format(item.createdAt)}</time><button type="button" onClick={()=>reply(item.id,item.authorName)}>Yanıtla</button></div></li>)}
      </ol>}
      <form className="legacy-answer-reply-form" onSubmit={comment}>
        {replyTo&&<span className="legacy-reply-target" data-comment-id={replyTo.id}>{replyTo.name} kişisinin yorumuna yanıt</span>}<input id={`answer-comment-${answerId}`} ref={inputRef} value={body} onChange={event=>setBody(event.target.value)} minLength={2} maxLength={2000} required aria-label={replyTo?`${replyTo.name} kullanıcısına yanıt ver`:"Yorum ekle"} placeholder={replyTo?"Yanıtını yaz...":"Yorum ekle..."}/>
        {replyTo&&<button className="legacy-answer-reply-cancel" type="button" onClick={()=>{setReplyTo(null);setBody("");}}>Vazgeç</button>}
        <button className="legacy-answer-reply-submit" disabled={busy||body.trim().length<2}>{busy?"Gönderiliyor":"Gönder"}</button>
      </form>
      {message&&<span className="legacy-answer-message" role="status">{message}</span>}
    </div>
  </>;
}
