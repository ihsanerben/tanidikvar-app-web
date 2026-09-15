import { permanentRedirect } from "next/navigation";
import { getQuestion } from "@/lib/api/questions";
import { questionSegment } from "@/lib/public-url";

export default async function LegacyQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const question = await getQuestion((await params).questionId);
  permanentRedirect(`/soru/${questionSegment(question.title, question.id)}`);
}
