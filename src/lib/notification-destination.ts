export type Note={id:string;type:string;title:string;body:string;targetType:string|null;targetId:string|null;questionId:string|null;answerId:string|null;universityId:string|null;metricKey?:string|null;createdAt:string;readAt:string|null};
export function notificationDestination(note:Note){
 if(note.type==="ACHIEVEMENT"||note.type==="TITLE_UPGRADED")return "/hesabim/rozetler";
 if(note.targetType==="QUESTION"&&note.targetId)return `/soru/${note.targetId}`;
 if(note.questionId&&note.answerId)return `/soru/${note.questionId}?yanit=${note.answerId}${note.targetType==="ANSWER_COMMENT"?`&yorum=${note.targetId}`:""}#${note.targetType==="ANSWER_COMMENT"?`comment-${note.targetId}`:`answer-${note.answerId}`}`;
 if(note.targetType==="METRIC"&&note.universityId&&note.metricKey&&/^[A-Z_]+$/.test(note.metricKey))return `/universite/${note.universityId}?sekme=olcumler&olcum=${note.metricKey}#metric-${note.metricKey}`;
 const tab={POLL:"anketler",EVALUATION:"degerlendirmeler",EXPERIENCE:"deneyimler",METRIC:"olcumler"}[note.targetType??""];
 if(note.universityId&&tab)return `/universite/${note.universityId}?sekme=${tab}&icerik=${note.targetId}#content-${note.targetId}`;
 if(note.targetType==="UNIVERSITY"&&note.targetId)return `/universite/${note.targetId}`;
 if(note.targetType==="PROGRAM"&&note.targetId)return `/program/${note.targetId}`;
 if(note.targetType==="APPLICATION")return "/hesabim/tanidik-basvurusu";
 return "/hesabim";
}
