import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfileAnswerHistory } from "@/lib/api/answers";
import { getQuestion, type QuestionScope } from "@/lib/api/questions";
import { questionSegment } from "@/lib/public-url";
import { currentProfile, currentUser } from "@/lib/session";

type AnswerType = "COMMUNITY" | "TANIDIK";
type Props = { type: AnswerType; scope?: string; unified?: boolean };
const scopes = new Set<QuestionScope>(["GENERAL", "UNIVERSITY", "UNIVERSITY_DEPARTMENT"]);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(item => item[0]).join("").toLocaleUpperCase("tr-TR");
const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(value));

export async function ProfileAnswerHistory({ type, scope, unified = false }: Props) {
  const user = await currentUser();
  if (!user) redirect("/giris");
  const profile = await currentProfile();
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user.email;
  const selected = scopes.has(scope as QuestionScope) ? scope as QuestionScope : undefined;
  const [tanidikAnswers,communityAnswers] = await Promise.all([getProfileAnswerHistory(user.id,"TANIDIK").catch(()=>[]),getProfileAnswerHistory(user.id,"COMMUNITY").catch(()=>[])]);
  const answers=type==="TANIDIK"?tanidikAnswers:communityAnswers;
  const rows = await Promise.all(answers.map(async answer => ({ answer, question: await getQuestion(answer.questionId).catch(() => null) })));
  const visible = selected ? rows.filter(row => row.question?.scope === selected) : rows;
  const title = unified ? "Yorumlarım" : type === "TANIDIK" ? "Tanıdık yorumlarım" : "Topluluk yorumlarım";
  return <section className="legacy-history-page">
    <div className="legacy-history-heading">
      <div><Link href="/hesabim">← Hesabıma dön</Link><h1>{title}</h1></div>
      <form>{unified && <input type="hidden" name="tur" value={type === "TANIDIK" ? "tanidik" : "topluluk"}/>}<label>Kapsam<select name="kapsam" defaultValue={selected ?? ""}><option value="">Tümü</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite + Bölüm</option></select></label><button className="button">Uygula</button></form>
    </div>
    {unified && <nav className="legacy-contribution-tabs history-type-tabs" aria-label="Yorum türü"><Link className={type === "TANIDIK" ? "active" : ""} href="/hesabim/yorumlarim?tur=tanidik">Tanıdık yorumları <span>{tanidikAnswers.length}</span></Link><Link className={type === "COMMUNITY" ? "active" : ""} href="/hesabim/yorumlarim?tur=topluluk">Toplum yorumları <span>{communityAnswers.length}</span></Link></nav>}
    <div className="legacy-history-list">
      {visible.map(({ answer, question }) => <article className="legacy-history-card" key={answer.id}>
        <header className="legacy-history-question"><small>Soruyu soran</small><h2><strong>{question?.authorName ?? "Üye"}:</strong> {question?.title ?? "Soru artık görüntülenemiyor"}</h2></header>
        <div className="legacy-history-author"><span className={`legacy-avatar role-${(profile?.educationStatus ?? "user").toLowerCase()}${type === "TANIDIK" ? " is-tanidik" : ""}`}><span>{initials(name)}</span>{type === "TANIDIK" && <i>★★★</i>}</span><div><strong>{answer.authorName || name}</strong>{type === "TANIDIK" && <small>{[answer.universityName, answer.departmentName].filter(Boolean).join(" · ")}</small>}</div></div>
        <p>{answer.body}</p>
        <footer><time dateTime={answer.publishedAt}>{formatDate(answer.publishedAt)}</time>{question && <Link href={`/soru/${questionSegment(question.title, question.id)}`}>Soru detayı</Link>}</footer>
      </article>)}
      {!visible.length && <div className="legacy-history-empty">Bu kapsamda henüz yorumun yok.</div>}
    </div>
    <Link className="button secondary account-back-bottom" href="/hesabim">Hesabıma dön</Link>
  </section>;
}
