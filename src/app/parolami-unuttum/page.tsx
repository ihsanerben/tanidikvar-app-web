import Link from "next/link";
import {AuthActionForm} from "@/components/auth-action-form";

export const metadata={title:"Parolamı unuttum",robots:{index:false,follow:false}};

export default function Page(){return <section className="auth-page auth-recovery-page"><div className="auth-recovery-card"><p className="eyebrow">Hesap güvenliği</p><AuthActionForm mode="forgot"/><p className="auth-recovery-back"><Link href="/giris">← Oturum açmaya dön</Link></p></div></section>}
