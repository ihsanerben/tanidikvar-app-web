import { useEffect,useState } from 'react'
import { apiGet,apiMutation,isRecord } from '../../api/apiClient'
import { useAuth } from '../auth/useAuth'
export function AnswerLikeButton({answerId,initialCount=0}:{answerId:string;initialCount?:number}){
 const auth=useAuth(),userId=auth.user?.id,[liked,setLiked]=useState(false),[count,setCount]=useState(initialCount),[pending,setPending]=useState(false)
 useEffect(()=>{if(!userId)return;const c=new AbortController();apiGet(`/api/answers/${answerId}/like`,c.signal).then(v=>{if(isRecord(v)&&typeof v.liked==='boolean'&&typeof v.likeCount==='number'){setLiked(v.liked);setCount(v.likeCount)}}).catch(()=>undefined);return()=>c.abort()},[answerId,userId])
 if(!auth.user)return <span className="answer-like-count">♥ {count}</span>
 return <button type="button" className={`answer-like-button ${liked?'is-liked':''}`} disabled={pending} aria-pressed={liked} onClick={()=>{const next=!liked;setPending(true);void apiMutation(`/api/answers/${answerId}/like`,'PUT',{liked:next}).then(v=>{if(isRecord(v)&&typeof v.likeCount==='number'){setLiked(next);setCount(v.likeCount)}}).finally(()=>setPending(false))}}>♥ {count}</button>
}
