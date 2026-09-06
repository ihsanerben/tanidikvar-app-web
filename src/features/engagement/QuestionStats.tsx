import type { ReactNode } from 'react'
import type { Statistics } from './engagementApi'
export function QuestionStats({statistics:s,likeControl}:{statistics:Statistics;likeControl?:ReactNode}) {
 const count=(n:number)=>n.toLocaleString('tr-TR')
 return <div className="question-stats" aria-label="Soru istatistikleri"><span>{count(s.viewCount)} görüntülenme</span>{likeControl??<span>{count(s.likeCount)} beğeni</span>}<span>{count(s.totalAnswerCount)} yorum</span><span>Topluluk: {count(s.communityAnswerCount)}</span><span>Admin: {count(s.adminAnswerCount)}</span></div>
}
