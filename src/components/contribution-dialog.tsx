"use client";
import {createContext,useContext,useState,type ReactNode} from "react";
import {Button} from "@/components/ui";
import {ModalShell} from "@/components/modal-shell";
const ContributionCloseContext=createContext<(()=>void)|undefined>(undefined);
export const useContributionClose=()=>useContext(ContributionCloseContext);
export function ContributionDialog({label,children}:{label:string;children:ReactNode}) {
 const [open,setOpen]=useState(false);
 return <><Button type="button" tone="secondary" onClick={()=>setOpen(true)}>{label}</Button><ModalShell open={open} onClose={()=>setOpen(false)} title={label}><ContributionCloseContext.Provider value={()=>setOpen(false)}>{children}</ContributionCloseContext.Provider></ModalShell></>;
}
