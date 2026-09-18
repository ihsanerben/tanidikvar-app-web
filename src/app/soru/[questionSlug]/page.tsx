import type {Metadata} from "next";
import Link from "next/link";
import {notFound,permanentRedirect} from "next/navigation";
import {getQuestion,QuestionApiError,type QuestionItem} from "@/lib/api/questions";
import {getAnswerComments,getQuestionAnswers,type AnswerItem} from "@/lib/api/answers";
import {catalogSegment,questionIdFromSegment,questionSegment} from "@/lib/public-url";
import {QuestionIconActions} from "@/components/question-icon-actions";
import {QuestionViewRecorder} from "@/components/question-view-recorder";
import {AnswerLikeButton} from "@/components/answer-like-button";
import {AnswerActions} from "@/components/answer-actions";
import {LegacyAnswerTabs} from "@/components/legacy-answer-tabs";
import {currentUser} from "@/lib/session";
import {QuestionOwnerActions} from "@/components/question-owner-actions";
import {QuestionScopeLinks} from "@/components/question-scope-links";

type Props={params:Promise<{questionSlug:string}>};
const formatDate=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR");
const education=(status:string|null)=>({YKS_ADAYI:"YKS Adayı",UNIVERSITE_OGRENCISI:"Üniversite Öğrencisi",MEZUN:"Mezun"}[status??""]??null);
async function resolveQuestion(segment:string){const id=questionIdFromSegment(segment);if(!id)notFound();try{return await getQuestion(id);}catch(error){if(error instanceof QuestionApiError&&error.status===404)notFound();throw error;}}
export async function generateMetadata({params}:Props):Promise<Metadata>{const q=await resolveQuestion((await params).questionSlug);return{title:q.title,description:q.body?.slice(0,155)??`${q.title} hakkında topluluk yanıtları`,alternates:{canonical:`/soru/${questionSegment(q.title,q.id)}`},openGraph:{title:q.title,description:q.body?.slice(0,155)}};}

function Icon({type}:{type:"view"|"like"|"answer"}){if(type==="view")return <svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>;if(type==="like")return <svg viewBox="0 0 24 24"><path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z"/></svg>;return <svg viewBox="0 0 24 24"><path d="M4 4.5h16v12H9l-5 4v-16Z"/></svg>;}
function CommentIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v12H9l-5 4v-16Z"/></svg>;}

async function AnswerCard({answer,questionId,best,canSelectBest}:{answer:AnswerItem;questionId:string;best:boolean;canSelectBest:boolean}){
 const comments=await getAnswerComments(answer.id),label=answer.activeAdmin?"Tanıdık":education(answer.educationStatus);
 return <li className={`legacy-answer-card${best?" best-answer":""}`}>{best&&<p className="legacy-best-label">✓ En iyi cevap</p>}<div className="legacy-answer-heading"><div className="legacy-answer-person"><span className={`legacy-avatar role-${(answer.educationStatus??"user").toLowerCase()}${answer.activeAdmin?" is-tanidik":""}`} aria-hidden="true"><span>{initials(answer.authorName)}</span>{answer.activeAdmin&&<i>★★★</i>}</span><div><strong>{answer.authorId&&answer.activeAdmin?<Link href={`/tanidik/${answer.authorId}`}>{answer.authorName}</Link>:answer.authorName}</strong>{answer.educationVerified&&<span className="legacy-verified" title="Eğitim bilgisi doğrulandı">✓</span>}</div></div><div className="legacy-answer-school">{answer.universityName&&<span>{answer.universityName}</span>}{answer.departmentName&&<span>{answer.departmentName}</span>}{!answer.universityName&&label&&<span>{label}</span>}</div></div><p className="legacy-answer-body">{answer.body}</p><div className="legacy-answer-date-row"><time dateTime={answer.publishedAt}>{formatDate(answer.publishedAt)}</time><AnswerLikeButton answerId={answer.id} initialCount={answer.likeCount}/><label className="legacy-answer-comment-button" htmlFor={`answer-comment-${answer.id}`} aria-label="Yorum ekle" title="Yorum ekle"><CommentIcon/><span>{comments.length}</span></label></div><AnswerActions answerId={answer.id} questionId={questionId} answerAuthor={answer.authorName} canSelectBest={canSelectBest&&!best} initialComments={comments}/></li>;
}

export default async function QuestionPage({params}:Props){
 const{questionSlug}=await params,question=await resolveQuestion(questionSlug);const[answers,user]=await Promise.all([getQuestionAnswers(question.id),currentUser()]);
 const canonical=questionSegment(question.title,question.id);if(questionSlug!==canonical)permanentRedirect(`/soru/${canonical}`);
 const university=question.universityId&&question.universityName?catalogSegment(question.universityName,question.universityId):null,tanidikAnswers=answers.filter(answer=>answer.answerType==="TANIDIK"),communityAnswers=answers.filter(answer=>answer.answerType!=="TANIDIK");
 const cards=(items:AnswerItem[])=>items.length?<ol className="legacy-answer-list">{items.map(answer=><AnswerCard key={answer.id} answer={answer} questionId={question.id} best={answer.id===question.bestAnswerId} canSelectBest={user?.id===question.authorId}/>)}</ol>:<div className="legacy-empty compact"><h3>Henüz yorum yok</h3><p>Bu soruya ilk deneyimi sen ekleyebilirsin.</p></div>;
 const jsonLd={"@context":"https://schema.org","@type":"QAPage",mainEntity:{"@type":"Question",name:question.title,text:question.body??question.title,dateCreated:question.createdAt,answerCount:answers.length,acceptedAnswer:answers.filter(a=>a.id===question.bestAnswerId).map(a=>({"@type":"Answer",text:a.body,dateCreated:a.publishedAt}))[0],suggestedAnswer:answers.filter(a=>a.id!==question.bestAnswerId).map(a=>({"@type":"Answer",text:a.body,dateCreated:a.publishedAt}))}};
 return <article className="legacy-question-detail"><QuestionViewRecorder questionId={question.id}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/><Link className="legacy-back-link" href="/sorular">← Sorulara dön</Link><div className="legacy-question-context"><QuestionScopeLinks question={question} compactGeneral/>{question.tags.filter(tag=>tag.available).map(tag=><span className="legacy-question-tag" key={tag.id}>#{tag.name}</span>)}</div><h1>{question.title}</h1>{question.body&&<p className="legacy-question-body">{question.body}</p>}
 <div className="legacy-detail-meta"><div className="legacy-byline"><span className={`legacy-avatar role-${(question.educationStatus??"user").toLowerCase()}${question.activeAdmin?" is-tanidik":""}`} aria-hidden="true"><span>{initials(question.authorName)}</span>{question.activeAdmin&&<i>★★★</i>}</span><span>{question.authorName}</span><time dateTime={question.createdAt}>{formatDate(question.createdAt)}</time></div><div className="legacy-question-stats"><span aria-label={`${question.statistics.viewCount} görüntülenme`}><Icon type="view"/>{question.statistics.viewCount}</span><QuestionIconActions questionId={question.id} title={question.title} initialLikeCount={question.statistics.likeCount} answerCount={question.statistics.totalAnswerCount} canAnswer={Boolean(user)&&!question.archivedAt} tanidik={user?.role==="TANIDIK"}/>{question.archivedAt&&<span>Arşivlendi</span>}</div></div>
 {user?.id===question.authorId&&<QuestionOwnerActions id={question.id} slug={canonical} version={question.version} archived={Boolean(question.archivedAt)}/>} 
 <section className="legacy-answer-section">{university&&<span className="sr-only">{question.universityName}</span>}<LegacyAnswerTabs tanidikCount={tanidikAnswers.length} communityCount={communityAnswers.length} tanidik={cards(tanidikAnswers)} community={cards(communityAnswers)}/></section></article>;
}
