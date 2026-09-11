import { type AdminAnswer } from './adminAnswerApi'
import { CommentCard } from '../answers/CommentCard'
export function AdminAnswerCard({answer:a,showQuestion=false}:{answer:AdminAnswer;showQuestion?:boolean}){
 return <CommentCard comment={a} showQuestion={showQuestion}/>
}
