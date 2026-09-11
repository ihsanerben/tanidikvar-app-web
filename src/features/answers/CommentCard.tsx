import { Link } from 'react-router-dom'
import { ProfileTrigger } from '../profile/PublicProfilePopup'
import { questionDate } from '../questions/questionApi'
import { AnswerLikeButton } from './AnswerLikeButton'

export interface CommentCardData {id:string;questionId:string;authorId:string|null;authorName:string;avatarFileId?:string|null;educationStatus?:string|null;activeAdmin?:boolean;universityName?:string|null;departmentName?:string|null;body:string;publishedAt:string;editedAt?:string|null;deletedAt?:string|null;moderatedAt?:string|null;likeCount?:number;questionTitle?:string}

export function CommentCard({comment:a,showQuestion=false}:{comment:CommentCardData;showQuestion?:boolean}){
 return <article className="answer-card comment-card" id={`yorum-${a.id}`}>
  {showQuestion&&a.questionTitle&&<h3><Link to={`/questions/${a.questionId}#yorum-${a.id}`}>{a.questionTitle}</Link></h3>}
  <header className="comment-card-author"><ProfileTrigger id={a.authorId} name={a.authorName} avatarFileId={a.avatarFileId} educationStatus={a.educationStatus} isAdmin={a.activeAdmin} detailHref={a.authorId?`/profiles/${a.authorId}`:undefined}/>{(a.universityName||a.departmentName)&&<p className="comment-education">{a.universityName&&<span>{a.universityName}</span>}{a.departmentName&&<span>{a.departmentName}</span>}</p>}</header>
  <AnswerLikeButton answerId={a.id} initialCount={a.likeCount}/>
  <p className="answer-body">{a.body}</p>
  <footer className="comment-card-footer"><time dateTime={a.publishedAt}>{questionDate(a.publishedAt)}</time>{a.editedAt&&<span>Düzenlendi</span>}{a.moderatedAt&&<span>Manager tarafından gizlendi</span>}{a.deletedAt&&<span>Kaldırıldı</span>}</footer>
 </article>
}
