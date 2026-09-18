"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/client-api";
import {Button} from "@/components/ui";

export function AnswerForm({ questionId, tanidik = false, onSuccess, onCancel }: { questionId: string; tanidik?: boolean; onSuccess?:()=>void; onCancel?:()=>void }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    try {
      const body = new FormData(form).get("body");
      const anonymousControl = form.elements.namedItem("anonymous");
      await apiRequest(`/questions/${questionId}/${tanidik ? "admin-answers" : "answers"}`, {
        method: "POST",
        body: JSON.stringify({ body, anonymous: tanidik && anonymousControl instanceof HTMLInputElement ? anonymousControl.checked : false }),
      });
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Yanıt yayınlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack-form wide" onSubmit={submit}>
      <label>
        Deneyimini paylaş
        <textarea name="body" required minLength={10} maxLength={5000} rows={6} placeholder="Somut, güncel ve karar vermeye yardımcı bir yanıt yaz." />
      </label>
      {tanidik && <label className="check-label"><input name="anonymous" type="checkbox" /> Kimliğimi public yüzeyde gizle</label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="answer-form-actions">
        <Button disabled={busy}>{busy ? "Yayınlanıyor…" : "Yanıtı yayınla"}</Button>
        {onCancel && <Button tone="secondary" type="button" disabled={busy} onClick={onCancel}>Vazgeç</Button>}
      </div>
    </form>
  );
}
