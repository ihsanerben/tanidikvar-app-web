import { notFound, redirect } from "next/navigation";
import { AskQuestionForm } from "@/components/ask-question-form";
import { getQuestion } from "@/lib/api/questions";
import { questionIdFromSegment } from "@/lib/public-url";
import { currentUser } from "@/lib/session";

export const metadata = { title: "Soruyu düzenle", robots: { index: false, follow: false } };
export default async function EditQuestionPage({ params }: { params: Promise<{ questionSlug: string }> }) {
  const user = await currentUser(); if (!user) redirect("/giris");
  const id = questionIdFromSegment((await params).questionSlug); if (!id) notFound();
  const question = await getQuestion(id); if (question.authorId !== user.id || question.archivedAt) notFound();
  return <section className="content-section"><p className="eyebrow">Sorularım</p><h1>Soruyu düzenle</h1><AskQuestionForm initial={question}/></section>;
}
