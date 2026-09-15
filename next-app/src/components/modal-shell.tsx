"use client";

import {useEffect,useId,useRef,type ReactNode} from "react";

export function ModalShell({open,onClose,title,children,className=""}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;className?:string}){
 const titleId=useId(),closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")closeRef.current();};document.addEventListener("keydown",close);const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",close);document.body.style.overflow=overflow;};},[open]);
 if(!open)return null;
 return <div className="ui-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><section className={`ui-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId}><button className="ui-modal-close" type="button" onClick={onClose} aria-label="Pencereyi kapat">×</button><h2 id={titleId}>{title}</h2>{children}</section></div>;
}
