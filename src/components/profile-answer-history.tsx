import Link from "next/link";
import { redirect } from "next/navigation";
import { type AnswerItem,type AnswerPage } from "@/lib/api/answers";
import { getQuestion, type QuestionScope } from "@/lib/api/questions";
import { questionSegment } from "@/lib/public-url";
import { authenticatedApi,currentProfile, currentUser } from "@/lib/session";
import {HistoryAnswerEdit} from "@/components/history-answer-edit";

type AnswerType = "COMMUNITY" | "TANIDIK";
type Props = { type: AnswerType; scope?: string; unified?: boolean; anonymousOnly?:boolean; page?: number };
const scopes = new Set<QuestionScope>(["GENERAL", "UNIVERSITY", "UNIVERSITY_DEPARTMENT"]);
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(item => item[0]).join("").toLocaleUpperCase("tr-TR");
const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(value));

export async function ProfileAnswerHistory({ type, scope, unified = false,anonymousOnly=false, page=0 }: Props) {
  const user = await currentUser();
  if (!user) redirect("/giris");
  const profile = await currentProfile();
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user.email;
  const selected = scopes.has(scope as QuestionScope) ? scope as QuestionScope : undefined;
  const currentPage = Number.isInteger(page) && page >= 0 && page <= 10000 ? page : 0;
  const query = new URLSearchParams({ size: "20", page: String(currentPage), anonymous: String(anonymousOnly) });
  if (selected) query.set("scope", selected);
  const [ownTanidik, ownCommunity] = await Promise.all([
    authenticatedApi<AnswerPage>(`/me/admin-answers?${query}`),
    authenticatedApi<{items:{answer:AnswerItem;questionTitle:string}[];totalElements:number}>(`/me/answers?${query}`),
  ]);
  const answers = type === "TANIDIK" ? ownTanidik?.items ?? [] : ownCommunity?.items.map(item => ({...item.answer,questionTitle:item.questionTitle})) ?? [];
  const total = (type === "TANIDIK" ? ownTanidik : ownCommunity)?.totalElements ?? 0;
  const failed = type === "TANIDIK" ? !ownTanidik : !ownCommunity;
  const visible = await Promise.all(answers.map(async answer => ({ answer, question: await getQuestion(answer.questionId).catch(() => null) })));
  const href = (kind:AnswerType, anonymous=anonymousOnly, nextPage=0) => {
    const values = new URLSearchParams({tur:kind === "TANIDIK" ? "tanidik" : "topluluk"});
    if (selected) values.set("kapsam",selected);
    if (anonymous) values.set("anonim","1");
    if (nextPage) values.set("sayfa",String(nextPage));
    return `/hesabim/yorumlarim?${values}`;
  };
  const title = unified ? "Yorumlarım" : type === "TANIDIK" ? "Tanıdık yorumlarım" : "Topluluk yorumlarım";
  return <section className="legacy-history-page">
    <div className="legacy-history-heading">
      <div><Link href="/hesabim">← Hesabıma dön</Link><h1>{title}</h1></div>
      <form>{unified && <input type="hidden" name="tur" value={type === "TANIDIK" ? "tanidik" : "topluluk"}/>}{anonymousOnly && <input type="hidden" name="anonim" value="1"/>}<label>Kapsam<select name="kapsam" defaultValue={selected ?? ""}><option value="">Tümü</option><option value="GENERAL">Genel</option><option value="UNIVERSITY">Üniversite</option><option value="UNIVERSITY_DEPARTMENT">Üniversite + Bölüm</option></select></label><button className="button">Uygula</button></form>
    </div>
    {unified && <nav className="account-content-tabs history-type-tabs" aria-label="Yorum türü">
      <Link className={type === "TANIDIK" ? "active" : ""} aria-current={type === "TANIDIK" ? "page" : undefined} href={href("TANIDIK")}>Tanıdık yorumları <span>{ownTanidik?.totalElements ?? 0}</span></Link>
      <Link className={type === "COMMUNITY" ? "active" : ""} aria-current={type === "COMMUNITY" ? "page" : undefined} href={href("COMMUNITY")}>Topluluk yorumları <span>{ownCommunity?.totalElements ?? 0}</span></Link>
      <Link className={`anonymous-filter${anonymousOnly ? " active" : ""}`} href={href(type,!anonymousOnly)} aria-label={anonymousOnly ? "Normal yorumlarını göster" : "Seçili türdeki anonim yorumlarını göster"} title={anonymousOnly ? "Normal yorumlarını göster" : "Anonim yorumlarını göster"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{anonymousOnly && <path d="m3 3 18 18"/>}</svg>
      </Link>
    </nav>}
    {failed && <p role="alert">Yorumların yüklenemedi. Sayfayı yenileyerek tekrar dene.</p>}
    <div className="legacy-history-list">
      {visible.map(({ answer, question }) => <article className="legacy-history-card" key={answer.id}>
        <header className="legacy-history-question"><small>Soruyu soran</small><h2><strong>{question?.authorName ?? "Üye"}:</strong> {question?.title ?? "Soru artık görüntülenemiyor"}</h2></header>
        <div className="legacy-history-author"><span className={`legacy-avatar role-${(profile?.educationStatus ?? "user").toLowerCase()}${type === "TANIDIK" ? " is-tanidik" : ""}`}><span>{initials(name)}</span>{type === "TANIDIK" && <i>★★★</i>}</span><div><strong>{answer.authorName || name}</strong>{type === "TANIDIK" && <small>{[answer.universityName, answer.departmentName].filter(Boolean).join(" · ")}</small>}</div></div>
        <p>{answer.body}</p>
        <footer><time dateTime={answer.publishedAt}>{formatDate(answer.publishedAt)}</time><span><HistoryAnswerEdit id={answer.id} body={answer.body} version={answer.version} type={type}/>{question && <Link href={`/soru/${questionSegment(question.title, question.id)}`}>Soru detayı</Link>}</span></footer>
      </article>)}
      {!failed && !visible.length && <div className="legacy-history-empty">Bu kapsamda henüz yorumun yok.</div>}
    </div>
    {unified && <nav className="pagination" aria-label="Yorum sayfaları">{currentPage > 0 && <Link href={href(type,anonymousOnly,currentPage-1)}>Önceki</Link>}{(currentPage+1)*20 < total && <Link href={href(type,anonymousOnly,currentPage+1)}>Sonraki</Link>}</nav>}
    <Link className="button secondary account-back-bottom" href="/hesabim">Hesabıma dön</Link>
  </section>;
}
