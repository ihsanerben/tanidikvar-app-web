import Link from "next/link"; import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Oturum Aç", robots: { index: false, follow: false } };
export default function LoginPage() { return <section className="auth-page"><h1>Oturum aç</h1><AuthForm mode="login"/><div className="auth-login-options"><p>Hesabın yok mu? <Link href="/kayit">Hesap oluştur</Link></p><Link className="auth-forgot-link" href="/parolami-unuttum">Şifremi unuttum</Link></div></section>; }
