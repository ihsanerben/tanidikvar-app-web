import Link from "next/link";
import type {ReactNode} from "react";
import type {QuestionItem} from "@/lib/api/questions";
import {questionSegment} from "@/lib/public-url";
import {QuestionScopeLinks} from "@/components/question-scope-links";

const date=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR");
function StatIcon({type}:{type:"view"|"like"|"answer"}){if(type==="view")return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>;if(type==="like")return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z"/></svg>;return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v12H9l-5 4v-16Z"/></svg>}
export function QuestionCard({question,actions}:{question:QuestionItem;actions?:ReactNode}){
 const href=question.authorId?(question.activeAdmin?`/tanidik/${question.authorId}`:`/profiles/${question.authorId}`):null;
 const avatar=<span className={`legacy-avatar role-${(question.educationStatus??"user").toLowerCase()}${question.activeAdmin?" is-tanidik":""}`} aria-hidden="true"><span>{initials(question.authorName)}</span>{question.activeAdmin&&<i>★★★</i>}</span>;
 return <li><article className={`legacy-question-card${actions?" has-owner-actions":""}`}>
  {actions&&<div className="question-card-owner-actions">{actions}</div>}
  {(question.scope!=="GENERAL"||question.tags.some(tag=>tag.available))&&<div className="legacy-question-context"><QuestionScopeLinks question={question}/>{question.tags.filter(tag=>tag.available).map(tag=><span className="legacy-question-tag" key={tag.id}>#{tag.name}</span>)}</div>}
  <h2><Link href={`/soru/${questionSegment(question.title,question.id)}`}>{question.title}</Link></h2>{question.body&&<p className="legacy-question-excerpt">{question.body}</p>}
  <div className="legacy-question-bottom"><div className="legacy-byline">{href?<Link className="question-author-link" href={href}>{avatar}<span>{question.authorName}</span></Link>:<>{avatar}<span>{question.authorName}</span></>}<time dateTime={question.createdAt}>{date(question.createdAt)}</time></div><div className="legacy-question-stats"><span aria-label={`${question.statistics.viewCount} görüntülenme`}><StatIcon type="view"/>{question.statistics.viewCount}</span><span aria-label={`${question.statistics.likeCount} faydalı oy`}><StatIcon type="like"/>{question.statistics.likeCount}</span><span aria-label={`${question.statistics.totalAnswerCount} yorum`}><StatIcon type="answer"/>{question.statistics.totalAnswerCount}</span></div></div>
 </article></li>
}
