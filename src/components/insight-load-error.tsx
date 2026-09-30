"use client";
import {useRouter} from "next/navigation";
export function InsightLoadError(){const router=useRouter();return <section className="content-section university-tab-panel"><div className="empty-state" role="alert"><h2>Veriler yüklenemedi</h2><p>Bağlantını kontrol edip tekrar deneyebilirsin.</p><button className="button secondary" onClick={()=>router.refresh()}>Tekrar dene</button></div></section>;}
