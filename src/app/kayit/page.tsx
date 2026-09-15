import Link from "next/link"; import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Hesap Oluştur", robots: { index: false, follow: false } };
export default function RegisterPage() { return <section className="auth-page"><p className="eyebrow">Topluluğa katıl</p><h1>Hesap oluştur</h1><AuthForm mode="register"/><p>Zaten hesabın var mı? <Link href="/giris">Oturum aç</Link></p></section>; }
