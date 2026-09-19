import Link from "next/link";
import type {QuestionItem} from "@/lib/api/questions";
import {catalogSegment} from "@/lib/public-url";
import {plainProgramName} from "@/lib/program-label";

export function QuestionScopeLinks({question,compactGeneral=false}:{question:QuestionItem;compactGeneral?:boolean}){
 const departmentName=plainProgramName(question.departmentName);
 const universityHref=question.universityId&&question.universityName?`/universite/${catalogSegment(question.universityName,question.universityId)}`:null;
 const departmentHref=question.programId?`/program/${question.programId}`:universityHref&&question.departmentId&&departmentName?`${universityHref}/${catalogSegment(departmentName,question.departmentId)}`:null;
 return <span className={`legacy-scope-badge scope-${question.scope.toLowerCase()}${compactGeneral&&question.scope==="GENERAL"?" scope-dot-only":""}`} aria-label={compactGeneral&&question.scope==="GENERAL"?"Genel soru":undefined}>
  {question.scope==="GENERAL"?(compactGeneral?null:"Genel"):<>
   {universityHref?<Link href={universityHref} target="_blank" rel="noopener noreferrer" aria-label={`${question.universityName} sayfasını yeni sekmede aç`}>{question.universityName}</Link>:question.universityName}
   {question.scope==="UNIVERSITY_DEPARTMENT"&&departmentName&&<> · {departmentHref?<Link href={departmentHref} target="_blank" rel="noopener noreferrer" aria-label={`${departmentName} sayfasını yeni sekmede aç`}>{departmentName}</Link>:departmentName}</>}
  </>}
 </span>;
}
