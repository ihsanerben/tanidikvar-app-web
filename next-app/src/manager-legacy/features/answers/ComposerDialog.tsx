import { useEffect,useId,useRef,type ReactNode } from 'react'
export function ComposerDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null),titleId=useId()
 useEffect(()=>{const dialog=ref.current,previous=document.activeElement,overflow=document.body.style.overflow;dialog?.showModal();document.body.style.overflow='hidden';return()=>{dialog?.close();document.body.style.overflow=overflow;if(previous instanceof HTMLElement&&previous.isConnected)previous.focus()}},[])
 return <dialog ref={ref} className="composer-dialog" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();onClose()}}><button type="button" className="composer-close" aria-label="Pencereyi kapat" onClick={onClose}>×</button><h2 id={titleId}>{title}</h2>{children}</dialog>
}
