"use client";
import {useEffect,useRef} from "react";
import {apiRequest} from "@/lib/client-api";

export function QuestionViewRecorder({questionId}:{questionId:string}){
 const recorded=useRef(false);
 useEffect(()=>{
  if(recorded.current)return;
  recorded.current=true;
  void apiRequest(`/questions/${questionId}/views`,{method:"POST",body:JSON.stringify({openingEventId:crypto.randomUUID()})}).catch(()=>undefined);
 },[questionId]);
 return null;
}
