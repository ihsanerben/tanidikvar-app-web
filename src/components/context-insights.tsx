import {InsightLoadError} from "./insight-load-error";
import {ContributionByline} from "./contribution-byline";
import {ExperienceList} from "@/components/experience-list";
import {MetricParticipation} from "@/components/metric-participation";
import {EvaluationRatings} from "@/components/evaluation-ratings";
import {getDecisionData,getEvaluationCriteria,type EvaluationRating,type PollParticipation} from "@/lib/api/decisions";
import {authenticatedApi,currentProfile,currentUser} from "@/lib/session";
import {PollVoteForms} from "@/components/decision-actions";
import {ContributionDialog} from "@/components/contribution-dialog";
import {PollCreateForm} from "@/components/poll-create-form";

export async function ContextInsights({universityId,programId,view="genel",embedded=false,targetId,metricKey,programCount,questionCount,tanidikCount}:{universityId:string;programId?:string;view?:"genel"|"degerlendirmeler"|"anketler"|"olcumler"|"deneyimler";embedded?:boolean;targetId?:string;metricKey?:string;programCount?:number;questionCount?:number;tanidikCount?:number}) {
  const user=await currentUser(),profile=user?await currentProfile():null;
  const canContribute=!!user&&user.role!=="MANAGER"&&["UNIVERSITE_OGRENCISI","MEZUN"].includes(profile?.educationStatus??"")&&profile?.education?.universityId===universityId&&(!programId||profile.programId===programId);
  if(view==="deneyimler")return <section className="content-section university-tab-panel"><ExperienceList universityId={universityId} programId={programId} currentUserId={user?.id} canContribute={canContribute} targetId={targetId}/></section>;
  let data;try{data=await getDecisionData(universityId,programId,targetId,view);}catch{return <InsightLoadError/>;}
  if(view==="degerlendirmeler"){
    const params=new URLSearchParams({universityId});if(programId)params.set("programId",programId);
    const [criteria,ratings]=await Promise.all([getEvaluationCriteria(universityId,programId).catch(()=>null),canContribute?authenticatedApi<EvaluationRating[]>(`/evaluations/my-ratings?${params}`):Promise.resolve([])]);
    if(!criteria)return <InsightLoadError/>;
    return <section className="content-section university-tab-panel">{!canContribute&&<p className="contribution-policy">Bu üniversitenin öğrencileri ve mezunları değerlendirmeye katılabilir.</p>}{targetId&&data.evaluations.filter(item=>item.id===targetId).map(item=><article className="experience-card notification-target" id={`content-${item.id}`} key={item.id}><ContributionByline authorId={item.authorId} authorName={item.authorName} createdAt={item.createdAt}/><p>{item.rating} / 5{item.body?` · ${item.body}`:""}</p></article>)}<EvaluationRatings universityId={universityId} programId={programId} criteria={criteria} ratings={ratings} canContribute={canContribute}/></section>;
  }
  if(view==="anketler"){
    const participation=user&&data.polls.length?await authenticatedApi<PollParticipation[]>(`/me/poll-votes?pollIds=${data.polls.map(item=>item.id).join(',')}`):[];
    return <section className="content-section university-tab-panel"><header className="insight-toolbar poll-toolbar"><span>{data.pollCount.toLocaleString("tr-TR")} anket</span>{canContribute&&user?.role==="TANIDIK"&&<ContributionDialog label="Anket ekle"><PollCreateForm universityId={universityId} programId={programId}/></ContributionDialog>}</header><PollVoteForms polls={data.polls} total={data.pollCount} universityId={universityId} programId={programId} participation={participation} authenticated={!!user} canVote={!!user&&user.role!=="MANAGER"&&(profile?.educationStatus==="UNIVERSITE_OGRENCISI"||user.role==="TANIDIK")&&profile?.education?.universityId===universityId}/></section>;
  }
  if(view==="genel")return <section className="content-section university-overview"><div className="overview-metrics">{[
    {label:"Topluluk puanı",value:data.summary.evaluationCount?`${data.summary.averageRating.toLocaleString("tr-TR",{maximumFractionDigits:1})} / 5`:"Henüz oy yok",detail:`${data.summary.evaluationCount} değerlendirme`},
    ...(programCount!==undefined?[{label:"Program",value:programCount,detail:"Katalogdaki programlar"}]:[]),
    ...(questionCount!==undefined?[{label:"Soru",value:questionCount,detail:"Üniversite topluluğundan"}]:[]),
    ...(tanidikCount!==undefined?[{label:"Tanıdık",value:tanidikCount,detail:"Bu üniversitedeki Tanıdıklar"}]:[]),
    {label:"Anket",value:data.pollCount,detail:"Topluluğun görüşleri"},
    {label:"Deneyim",value:data.experienceCount,detail:"Öğrenci ve mezun paylaşımları"},
    {label:"Ölçüm katkısı",value:data.metrics.reduce((sum,item)=>sum+item.sampleSize,0),detail:`${data.metrics.filter(item=>item.sampleSize>0).length} farklı ölçümde katkı`}
  ].map(item=><article className="overview-metric" key={item.label}><span>{item.label}</span><strong>{typeof item.value==="number"?item.value.toLocaleString("tr-TR"):item.value}</strong><small>{item.detail}</small></article>)}</div></section>;
  if(view==="olcumler")return <section className="content-section university-tab-panel">{!canContribute&&<p className="contribution-policy">Bu üniversitenin öğrencileri ve mezunları ölçümlere katılabilir.</p>}<MetricParticipation universityId={universityId} programId={programId} metrics={data.metrics} canContribute={canContribute} targetKey={metricKey}/></section>;
  return null;
}
