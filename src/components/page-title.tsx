"use client";

import {useState,type ReactNode} from "react";
import {ModalShell} from "@/components/modal-shell";

export function PageTitle({children,help,level=1}:{children:ReactNode;help:string;level?:1|2}){
 const[open,setOpen]=useState(false),Heading=level===1?"h1":"h2";
 return <><div className="page-title-row"><Heading>{children}</Heading><button className="page-help-button" type="button" onClick={()=>setOpen(true)} aria-label={`${String(children)} hakkında bilgi`}>?</button></div><ModalShell open={open} onClose={()=>setOpen(false)} title={String(children)} className="page-help-dialog"><p>{help}</p><button className="button" type="button" onClick={()=>setOpen(false)}>Anladım</button></ModalShell></>;
}
