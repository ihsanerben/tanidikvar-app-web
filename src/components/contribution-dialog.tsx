"use client";
import {useState,type ReactNode} from "react";
import {Button} from "@/components/ui";
import {ModalShell} from "@/components/modal-shell";
export function ContributionDialog({label,children}:{label:string;children:ReactNode}) {
 const [open,setOpen]=useState(false);
 return <><Button type="button" tone="secondary" onClick={()=>setOpen(true)}>{label}</Button><ModalShell open={open} onClose={()=>setOpen(false)} title={label}>{children}</ModalShell></>;
}
