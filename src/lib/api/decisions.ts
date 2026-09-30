export type Evaluation={id:string;authorId:string;authorName:string;rating:number;body:string|null;createdAt:string};export type EvaluationSummary={averageRating:number;evaluationCount:number};export type PollOption={id:string;label:string;voteCount:number};export type Poll={activeAdmin:boolean;educationStatus?:string;id:string;authorId:string;authorName:string;createdAt:string;question:string;verifiedOnly:boolean;closesAt:string|null;options:PollOption[];totalVotes:number;verifiedVoteCount:number};export type Metric={metricKey:string;average:number|null;sampleSize:number;verifiedSampleSize:number;updatedAt:string;privacyThresholdMet:boolean};export type Experience={version:number;universityId:string;programId?:string|null;activeAdmin:boolean;educationStatus?:string;editedAt?:string|null;id:string;authorId:string;authorName:string;templateType:string;title:string;body:string;sentiment:"POSITIVE"|"NEGATIVE"|"NEUTRAL";createdAt:string};export type Category={label:string;count:number};export type CareerSummary={sampleSize:number;verifiedSampleSize:number;averageJobSearchMonths:number|null;graduateStudyCount:number;sectors:Category[];firstRoles:Category[];companyTypes:Category[];updatedAt:string|null;privacyThresholdMet:boolean};export type Sentiments={positives:Category[];negatives:Category[]};
type Page<T>={items:T[];totalElements:number};const base=()=>process.env.API_BASE_URL??"http://localhost:8080";async function json<T>(path:string):Promise<T>{const response=await fetch(new URL(path,base()),{cache:"no-store",headers:{Accept:"application/json"}});if(!response.ok)throw new Error("Karar verisi yüklenemedi.");return response.json();}const query=(universityId:string,programId?:string)=>{const params=new URLSearchParams({universityId,size:"20"});if(programId)params.set("programId",programId);return params;};
export async function getDecisionData(universityId:string,programId?:string,targetId?:string,view="genel"){
 const params=query(universityId,programId),general=view==="genel";
 const [summary,evaluations,polls,metrics,experiences,sentiments,career]=await Promise.all([
  general||view==="degerlendirmeler"?json<EvaluationSummary>(`/api/evaluations/summary?${params}`):Promise.resolve({averageRating:0,evaluationCount:0}),
  view==="degerlendirmeler"&&targetId?targeted<Evaluation>(`/api/evaluations?${params}`,targetId):Promise.resolve({items:[] as Evaluation[],totalElements:0}),
  general||view==="anketler"?targeted<Poll>(`/api/polls?${params}`,view==="anketler"?targetId:undefined):Promise.resolve({items:[] as Poll[],totalElements:0}),
  general||view==="olcumler"?json<Metric[]>(`/api/context-metrics?${params}`):Promise.resolve([] as Metric[]),
  general||view==="deneyimler"?targeted<Experience>(`/api/experiences?${params}`,view==="deneyimler"?targetId:undefined):Promise.resolve({items:[] as Experience[],totalElements:0}),
  view==="deneyimler"?json<Sentiments>(`/api/experience-sentiments?${params}`):Promise.resolve({positives:[],negatives:[]} as Sentiments),
  programId&&view==="deneyimler"?json<CareerSummary>(`/api/career-outcomes?${params}`):Promise.resolve(null)
 ]);return{summary,pollCount:polls.totalElements,experienceCount:experiences.totalElements,evaluations:evaluations.items,polls:polls.items,metrics,experiences:experiences.items,sentiments,career};
}

async function targeted<T extends {id:string}>(path:string,targetId?:string):Promise<Page<T>>{
 const first=await json<Page<T>>(path);
 if(targetId&&/^[0-9a-f-]{36}$/i.test(targetId)&&!first.items.some(item=>item.id===targetId)){
  const response=await fetch(new URL(`${path.split('?')[0]}/${targetId}`,base()),{cache:"no-store"});
  if(response.ok) first.items.unshift(await response.json() as T);

 }
 return first;
}

export type EvaluationCriterion={criterionKey:string;label:string;averageRating:number;voteCount:number;distribution:number[]};
export type EvaluationRating={criterionKey:string;rating:number};
export const getEvaluationCriteria=(universityId:string,programId?:string)=>json<EvaluationCriterion[]>(`/api/evaluations/criteria?${query(universityId,programId)}`);

export type PollParticipation={pollId:string;optionId:string};
