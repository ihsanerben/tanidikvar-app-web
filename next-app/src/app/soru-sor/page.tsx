import { redirect } from "next/navigation"; import { currentUser } from "@/lib/session"; import { AskQuestionForm } from "@/components/ask-question-form";
export const metadata = { title: "Soru Sor", robots: { index: false, follow: false } };
export default async function AskPage() { if (!await currentUser()) redirect("/giris"); return <section className="content-section"><p className="eyebrow">Soru Sor</p><h1>Doğru kişilere ulaş</h1><p className="lead">Sorunu tek bir karar ihtiyacına odakla; kişisel veya hassas bilgi paylaşma.</p><AskQuestionForm/></section>; }
