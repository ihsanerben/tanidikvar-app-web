"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";

type Poll = { id: string; question: string; verifiedOnly: boolean; totalVotes:number; verifiedVoteCount:number; options: { id: string; label: string; voteCount: number }[] };

export function EvaluationForm({ universityId, programId }: { universityId: string; programId?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      await apiRequest("/evaluations", { method: "PUT", body: JSON.stringify({ universityId, programId: programId ?? null, rating: Number(data.get("rating")), body: data.get("body") || null }) });
      setMessage("Değerlendirmen kaydedildi."); router.refresh();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Değerlendirme kaydedilemedi."); }
    finally { setBusy(false); }
  }
  return <form className="stack-form decision-form" onSubmit={submit}><h3>Deneyimini değerlendir</h3><label>Puan<select name="rating" defaultValue="5" required>{[5,4,3,2,1].map(value=><option key={value} value={value}>{value} / 5</option>)}</select></label><label>Kısa değerlendirme<textarea name="body" maxLength={2000} rows={4}/></label>{message&&<p className="muted" role="status">{message}</p>}<button className="button" disabled={busy}>{busy?"Kaydediliyor…":"Değerlendir"}</button></form>;
}

export function PollVoteForms({ polls }: { polls: Poll[] }) {
  const router = useRouter(); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function vote(event: FormEvent<HTMLFormElement>, pollId: string) { event.preventDefault(); setBusy(true); setMessage(""); const optionId=new FormData(event.currentTarget).get("optionId"); try { await apiRequest(`/polls/${pollId}/vote`,{method:"PUT",body:JSON.stringify({optionId})}); setMessage("Oyun kaydedildi."); router.refresh(); } catch(reason){setMessage(reason instanceof Error?reason.message:"Oy kaydedilemedi.");} finally{setBusy(false);} }
  if (!polls.length) return null;
  return <div className="poll-actions">{polls.map(poll=><form key={poll.id} onSubmit={event=>vote(event,poll.id)}><fieldset><legend>{poll.question}</legend><p className="muted">{poll.totalVotes} oy · {poll.verifiedVoteCount} doğrulanmış katılımcı{poll.verifiedOnly?" · yalnız doğrulanmış katılım":""}</p>{poll.options.map(option=><label key={option.id}><input type="radio" name="optionId" value={option.id} required/> <span>{option.label}</span><strong>{option.voteCount}</strong></label>)}</fieldset><button className="button secondary" disabled={busy}>Oy ver</button></form>)}{message&&<p className="muted" role="status">{message}</p>}</div>;
}
