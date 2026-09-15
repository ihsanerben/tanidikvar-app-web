"use client";
import Link from "next/link";
import {useCallback,useEffect,useState} from "react";
import {apiRequest} from "@/lib/client-api";

const labels={activeUsers:"Aktif hesap",disabledUsers:"Pasif hesap",activeAdmins:"Aktif Tanıdık",pendingApplications:"Bekleyen başvuru",activeQuestions:"Aktif soru",archivedQuestions:"Arşivlenmiş soru",hiddenQuestions:"Gizlenmiş soru",communityAnswers:"Topluluk yorumu",adminAnswers:"Tanıdık yorumu",likes:"Beğeni",views:"Detay görüntülenmesi"} as const;
type Stats=Record<keyof typeof labels,number>;
const routes:Record<keyof Stats,string>={activeUsers:"/yonetim/kullanicilar?status=VISIBLE",disabledUsers:"/yonetim/kullanicilar?status=HIDDEN",activeAdmins:"/yonetim/kullanicilar?status=VISIBLE&authority=TANIDIK",pendingApplications:"/yonetim/basvurular",activeQuestions:"/yonetim/icerik?kind=QUESTION&status=VISIBLE",archivedQuestions:"/yonetim/icerik?kind=QUESTION&status=ALL",hiddenQuestions:"/yonetim/icerik?kind=QUESTION&status=HIDDEN",communityAnswers:"/yonetim/icerik?kind=COMMUNITY&status=ALL",adminAnswers:"/yonetim/icerik?kind=TANIDIK&status=ALL",likes:"/yonetim/analitik",views:"/yonetim/analitik"};

export function ManagerDashboard(){
 const[data,setData]=useState<Stats|null>(null),[error,setError]=useState("");
 const load=useCallback(()=>{setError("");return apiRequest<Stats>("/manager/statistics").then(setData).catch(cause=>setError(cause instanceof Error?cause.message:"İstatistikler yüklenemedi."));},[]);
 useEffect(()=>{void load();},[load]);
 if(error)return <div className="auth-card"><p role="alert">{error}</p><button className="button button-secondary" onClick={()=>void load()}>Tekrar dene</button></div>;
 if(!data)return <p role="status">Platform bilgileri yükleniyor…</p>;
 return <><div className="management-stats">{Object.entries(labels).map(([key,label])=><Link className="auth-card manager-stat-link" key={key} href={routes[key as keyof Stats]}><span>{label}</span><strong>{data[key as keyof Stats].toLocaleString("tr-TR")}</strong><span>İncele →</span></Link>)}</div><button className="button button-secondary" onClick={()=>void load()}>İstatistikleri yenile</button></>;
}
