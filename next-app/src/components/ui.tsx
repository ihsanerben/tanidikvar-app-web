import Link from "next/link";
import type {ComponentProps,ButtonHTMLAttributes,FormHTMLAttributes,HTMLAttributes,ReactNode} from "react";

type ButtonTone="primary"|"secondary"|"danger"|"success"|"warning"|"info"|"manager";
const classes=(...values:Array<string|false|null|undefined>)=>values.filter(Boolean).join(" ");
export const buttonClassName=(tone:ButtonTone="primary",className?:string)=>classes("button","ui-button",tone!=="primary"&&`ui-button-${tone}`,className);
export function Button({className,tone="primary",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{tone?:ButtonTone}){return <button {...props} className={buttonClassName(tone,className)}/>}
export function ButtonLink({className,tone="primary",...props}:ComponentProps<typeof Link>&{tone?:ButtonTone}){return <Link {...props} className={buttonClassName(tone,className)}/>}
export function Card({className,...props}:HTMLAttributes<HTMLElement>){return <article {...props} className={classes("ui-card",className)}/>} 
export function FilterPanel({className,...props}:FormHTMLAttributes<HTMLFormElement>){return <form {...props} className={classes("ui-filter-panel",className)}/>} 
export function PageHeader({className,...props}:HTMLAttributes<HTMLElement>){return <header {...props} className={classes("ui-page-header",className)}/>} 
export function Avatar({name,large=false}:{name:string;large?:boolean}){return <span className={`avatar${large?" large":""}`} aria-hidden="true">{name.trim().slice(0,1).toLocaleUpperCase("tr-TR")}</span>}
export function VerifiedBadge({label="Üniversite kimliği doğrulandı"}:{label?:string}){return <span className="verified-badge" title={label} aria-label={label}>✓ Doğrulanmış</span>}
export function TitleBadge({children}:{children:ReactNode}){return <span className="title-badge">{children}</span>}
export function AchievementBadge({children,tier="bronze"}:{children:ReactNode;tier?:"bronze"|"silver"|"gold"}){return <span className={`achievement-badge ${tier}`}>{children}</span>}
export function Tag({children}:{children:ReactNode}){return <span className="tag">{children}</span>}
export const UniversityChip=Tag;
export function StatCard({label,value}:{label:string;value:ReactNode}){return <Card className="stat-card"><strong>{value}</strong><span>{label}</span></Card>}
export function RatingBar({label,value,count}:{label:string;value:number;count:number}){return <div className="rating-bar"><span>{label}</span><meter min="0" max="5" value={value}/><strong>{value.toLocaleString("tr-TR")} · {count} kişi</strong></div>}
export function FilterChip({active,children}:{active?:boolean;children:ReactNode}){return <span className={`filter-chip${active?" active":""}`}>{children}</span>}
export function EmptyState({title,children,className=""}:{title:string;children:ReactNode;className?:string}){return <div className={classes("empty-state","ui-empty-state",className)}><h2>{title}</h2>{children}</div>}
export function Skeleton({className=""}:{className?:string}){return <span className={`skeleton ${className}`} aria-hidden="true"/>}
export function Tabs({children,label="Bölümler",className=""}:{children:ReactNode;label?:string;className?:string}){return <nav className={classes("ui-tabs",className)} aria-label={label}>{children}</nav>}
export function ProfileHeader(props:HTMLAttributes<HTMLElement>){return <header {...props} className={`profile-hero ${props.className??""}`.trim()}/>}
export function UniversityHeader(props:HTMLAttributes<HTMLElement>){return <header {...props} className={`context-hero ${props.className??""}`.trim()}/>}
export const QuestionCard=Card;export const AnswerCard=Card;export const Poll=Card;
