"use client";

import {useEffect,useId,useRef,type ReactNode} from "react";

export function ModalShell({open,onClose,title,children,className=""}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;className?:string}){
 const titleId=useId(),closeRef=useRef(onClose),dialogRef=useRef<HTMLElement>(null);closeRef.current=onClose;
 useEffect(()=>{if(!open)return;const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;dialogRef.current?.querySelector<HTMLElement>('textarea,input,select,button,a[href]')?.focus();const close=(event:KeyboardEvent)=>{if(event.key==="Escape")closeRef.current();if(event.key==="Tab"&&dialogRef.current){const focusable=[...dialogRef.current.querySelectorAll<HTMLElement>('textarea,input,select,button,a[href]')].filter(item=>!item.hasAttribute('disabled'));if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}};document.addEventListener("keydown",close);const overflow=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.removeEventListener("keydown",close);document.body.style.overflow=overflow;previous?.focus();};},[open]);
 if(!open)return null;
 return <div className="ui-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><section ref={dialogRef} className={`ui-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId}><button className="ui-modal-close" type="button" onClick={onClose} aria-label="Pencereyi kapat"><span aria-hidden="true">×</span></button><h2 id={titleId}>{title}</h2>{children}</section></div>;
}
