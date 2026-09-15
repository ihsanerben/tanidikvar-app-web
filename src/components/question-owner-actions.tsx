"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client-api";

export function QuestionOwnerActions({ id, slug, version, archived }: { id: string; slug: string; version: number; archived: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    if (!archived && !window.confirm("Soruyu arşivlemek istediğine emin misin?")) return;
    setBusy(true);
    try { await apiRequest(`/questions/${id}/${archived ? "restore" : "archive"}`, { method: "POST", body: JSON.stringify({ version }) }); router.refresh(); }
    finally { setBusy(false); }
  }
  return <div className="question-owner-actions">{!archived && <Link className="button secondary" href={`/soru/${slug}/duzenle`}>Soruyu düzenle</Link>}<button className="button secondary" type="button" disabled={busy} onClick={() => void toggle()}>{busy ? "İşleniyor…" : archived ? "Geri aç" : "Arşivle"}</button></div>;
}
