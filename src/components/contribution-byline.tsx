import {TanidikStars} from "./tanidik-stars";
import Link from "next/link";
export function ContributionByline({authorId,authorName,createdAt,activeAdmin=false,educationStatus}:{authorId?:string;authorName?:string;createdAt?:string;activeAdmin?:boolean;educationStatus?:string}) {
 const name=authorName?.trim()||"Topluluk üyesi";
 const date=createdAt?new Date(createdAt):null;
 return <div className="contribution-byline"><span className={`contribution-avatar legacy-avatar role-${(educationStatus??"user").toLowerCase()}${activeAdmin?" is-tanidik":""}`} aria-hidden="true"><span>{name.split(/\s+/).slice(0,2).map(part=>part[0]).join("")}</span>{activeAdmin&&<TanidikStars educationStatus={educationStatus}/>}</span><div>{authorId?<Link href={`/profiles/${authorId}`}>{name}</Link>:<strong>{name}</strong>}{date&&!Number.isNaN(date.getTime())&&<time dateTime={createdAt}>{date.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})}</time>}</div></div>;
}
