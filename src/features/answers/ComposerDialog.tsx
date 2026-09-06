import { useEffect,useRef,type ReactNode } from 'react'
export function ComposerDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null)
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close()},[])
 return <dialog ref={ref} className="composer-dialog" onCancel={e=>{e.preventDefault();onClose()}}><h2>{title}</h2>{children}</dialog>
}
