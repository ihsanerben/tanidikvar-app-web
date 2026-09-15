import Link from "next/link";
import { redirect } from "next/navigation";
import { authenticatedApi, currentUser } from "@/lib/session";
import { questionSegment } from "@/lib/public-url";
import type { QuestionItem, QuestionPage } from "@/lib/api/questions";
import { QuestionOwnerActions } from "@/components/question-owner-actions";

export const metadata = { title: "Sorularım", robots: { index: false, follow: false } };
export default async function MyQuestionsPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  if (!await currentUser()) redirect("/giris");
  const archived = (await searchParams).durum === "arsiv";
  const page = await authenticatedApi<QuestionPage>(`/me/questions?status=${archived ? "ARCHIVED" : "ACTIVE"}&size=100`);
  return <section className="legacy-account-page my-questions-page"><Link href="/hesabim">← Hesabıma dön</Link><h1>Sorularım</h1><nav className="account-content-tabs"><Link className={!archived ? "active" : ""} href="/hesabim/sorularim">Aktif</Link><Link className={archived ? "active" : ""} href="/hesabim/sorularim?durum=arsiv">Arşiv</Link></nav>{page?.items.length ? <ul className="my-question-list">{page.items.map((question: QuestionItem) => { const slug = questionSegment(question.title, question.id); return <li key={question.id}><div><Link href={`/soru/${slug}`}>{question.title}</Link><span>{question.statistics.viewCount} görüntülenme · {question.statistics.likeCount} beğeni · {question.statistics.totalAnswerCount} yorum</span></div><QuestionOwnerActions id={question.id} slug={slug} version={question.version} archived={Boolean(question.archivedAt)}/></li>; })}</ul> : <div className="legacy-empty"><h2>{archived ? "Arşivlenmiş sorun yok" : "Henüz soru sormadın"}</h2><Link className="button" href="/soru-sor">Soru sor</Link></div>}</section>;
}
