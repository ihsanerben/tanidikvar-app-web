"use client";
import {useCallback,useState} from "react";
import {AskQuestionForm} from "@/components/ask-question-form";
import {Button} from "@/components/ui";
import {ModalShell} from "@/components/modal-shell";
export function AskQuestionModal({className="",initialUniversityId,initialProgramId,defaultOpen=false,label="Soru sor"}:{className?:string;initialUniversityId?:string;initialProgramId?:string;defaultOpen?:boolean;label?:string}){const[open,setOpen]=useState(defaultOpen),close=useCallback(()=>setOpen(false),[]);return <><Button className={className} type="button" onClick={()=>setOpen(true)}>{label}</Button><ModalShell open={open} onClose={close} title="Soru sor" className="ask-question-dialog"><AskQuestionForm initialUniversityId={initialUniversityId} initialProgramId={initialProgramId} onCancel={close}/></ModalShell></>}
