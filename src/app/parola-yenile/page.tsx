import Link from "next/link";
import {AuthActionForm} from "@/components/auth-action-form";

export const metadata={title:"Parola yenileme",robots:{index:false,follow:false}};

export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){return <section className="auth-page auth-recovery-page"><div className="auth-recovery-card"><p className="eyebrow">Hesap güvenliği</p><AuthActionForm mode="reset" initialToken={(await searchParams).token}/><p className="auth-recovery-back"><Link href="/giris">← Oturum açmaya dön</Link></p></div></section>}
