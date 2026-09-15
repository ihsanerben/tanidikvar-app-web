"use client";
import {useCallback,useState} from "react";
import {AskQuestionForm} from "@/components/ask-question-form";
import {Button} from "@/components/ui";
import {ModalShell} from "@/components/modal-shell";
export function AskQuestionModal(){const[open,setOpen]=useState(false),close=useCallback(()=>setOpen(false),[]);return <><Button type="button" onClick={()=>setOpen(true)}>Soru sor</Button><ModalShell open={open} onClose={close} title="Soru sor" className="ask-question-dialog"><AskQuestionForm/></ModalShell></>}
