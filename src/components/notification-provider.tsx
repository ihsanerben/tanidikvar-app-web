"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { actionTone, notify, type NotificationTone } from "@/lib/notifications";
import type {DialogRequest} from "@/lib/dialogs";
import {ModalShell} from "@/components/modal-shell";
import {Button} from "@/components/ui";
import {apiRequest} from "@/lib/client-api";

type Notice = { id: number; message: string; tone: NotificationTone; href?: string };
type StoredNotification = { id: string; title: string; body: string; readAt: string | null };

export function NotificationProvider({ children, authenticated = false }: { children: ReactNode; authenticated?: boolean }) {
  const [items, setItems] = useState<Notice[]>([]);
  const [dialog,setDialog]=useState<DialogRequest|null>(null);
  const [dialogValue,setDialogValue]=useState("");
  const sequence = useRef(0);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    function receive(event: Event) {
      const detail = (event as CustomEvent<Omit<Notice, "id">>).detail;
      const id = ++sequence.current;
      setItems(value => [...value.slice(-3), { ...detail, id }]);
      const timer = setTimeout(() => {
        setItems(value => value.filter(item => item.id !== id));
        timers.delete(timer);
      }, 4200);
      timers.add(timer);
    }
    function receiveDialog(event:Event){const request=(event as CustomEvent<DialogRequest>).detail;setDialogValue(request.input?.initialValue??"");setDialog(request);}
    function cancel(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("button,a") : null;
      if (target?.textContent?.trim() === "Vazgeç" && !target.hasAttribute("disabled")) notify("İşlem iptal edildi.", "danger");
    }
    function closeOutsideMenus(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      document.querySelectorAll<HTMLDetailsElement>("details[data-close-on-outside][open]").forEach(menu => {
        if (!menu.contains(event.target as Node)) menu.open = false;
      });
    }
    function colors() {
      document.querySelectorAll<HTMLButtonElement>("button").forEach(button => {
        if (button.classList.contains("question-save-action")) {
          delete button.dataset.actionTone;
          return;
        }
        const tone = actionTone(button.textContent ?? "");
        if (tone) button.dataset.actionTone = tone;
        else delete button.dataset.actionTone;
      });
    }
    const observer = new MutationObserver(colors);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    colors();
    window.addEventListener("app:notification", receive);
    window.addEventListener("app:dialog",receiveDialog);
    document.addEventListener("click", cancel);
    document.addEventListener("pointerdown", closeOutsideMenus);
    return () => {
      observer.disconnect();
      window.removeEventListener("app:notification", receive);
      window.removeEventListener("app:dialog",receiveDialog);
      document.removeEventListener("click", cancel);
      document.removeEventListener("pointerdown", closeOutsideMenus);
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(()=>{
    if(!authenticated)return;
    let active=true,known=new Set<string>(),initialized=false,polling=false;
    async function poll(){if(polling||document.visibilityState==="hidden")return;polling=true;try{const page=await apiRequest<{items:StoredNotification[];totalElements:number}>("/me/notifications?size=100");if(!active)return;const unread=page.items.filter(item=>!item.readAt),fresh=initialized?unread.filter(item=>!known.has(item.id)):unread;if(fresh.length){const lead=fresh.length===1?fresh[0].title:`${fresh.length} yeni bildirim`;notify(`${lead}. ${unread.length} okunmamış bildirimin var.`,"info","/hesabim/bildirimler");}known=new Set(unread.map(item=>item.id));initialized=true;}catch{/* Geçici ağ hataları global arayüzü etkilemez. */}finally{polling=false;}}
    function resume(){if(document.visibilityState==="visible")void poll();}
    void poll();const timer=setInterval(()=>void poll(),5000);document.addEventListener("visibilitychange",resume);window.addEventListener("focus",resume);return()=>{active=false;clearInterval(timer);document.removeEventListener("visibilitychange",resume);window.removeEventListener("focus",resume)};
  },[authenticated]);

  function closeDialog(value:boolean|string|null){dialog?.resolve(value);setDialog(null);setDialogValue("");}
  function submitDialog(event:FormEvent){event.preventDefault();if(!dialog)return;if(dialog.input){if((dialog.input.minLength??0)>dialogValue.trim().length)return;closeDialog(dialogValue.trim());}else closeDialog(true);}

  return <>{children}<div className="notification-stack" aria-live="polite" aria-atomic="false">{items.map(item => <div role="status" className={`notification notification-${item.tone}${item.href?" notification-linked":""}`} key={item.id}>{item.href?<Link href={item.href} onClick={()=>setItems(value=>value.filter(entry=>entry.id!==item.id))}>{item.message}</Link>:<span>{item.message}</span>}<button type="button" aria-label="Bildirimi kapat" onClick={()=>setItems(value=>value.filter(entry=>entry.id!==item.id))}>×</button></div>)}</div><ModalShell open={Boolean(dialog)} onClose={()=>closeDialog(dialog?.input?null:false)} title={dialog?.title??"Onay"} className="app-confirm-dialog"><form onSubmit={submitDialog}><p>{dialog?.message}</p>{dialog?.input&&<label>{dialog.input.label}<textarea autoFocus value={dialogValue} minLength={dialog.input.minLength} maxLength={dialog.input.maxLength} onChange={event=>setDialogValue(event.target.value)}/></label>}<div className="question-report-actions"><Button tone={dialog?.tone==="danger"?"danger":undefined}>{dialog?.confirmLabel??"Devam et"}</Button><Button tone="secondary" type="button" onClick={()=>closeDialog(dialog?.input?null:false)}>{dialog?.cancelLabel??"Vazgeç"}</Button></div></form></ModalShell></>;
}
