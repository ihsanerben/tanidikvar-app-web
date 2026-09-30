"use client";

import { useState } from "react";
import { ModalShell } from "@/components/modal-shell";

export type ContributionSummary = { questionCount: number; commentCount: number; experienceCount: number; pollCount: number };

export function AccountReportButton({ summary = null }: { summary?: ContributionSummary | null }) {
  const [open, setOpen] = useState(false);
  const content = <><svg className="account-report-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Zm0 0v15"/></svg><span className="account-report-label">Tanıdık Karnesi</span></>;
  return <><button type="button" className="account-report-button" onClick={() => setOpen(true)}>{content}</button><ModalShell open={open} onClose={() => setOpen(false)} title="Tanıdık Karnesi" className="account-report-dialog"><div className="account-report-grid">{[
    ["Soru sayısı", summary?.questionCount], ["Yorum sayısı", summary?.commentCount],
    ["Deneyim paylaşma sayısı", summary?.experienceCount], ["Anket açma sayısı", summary?.pollCount],
  ].map(([label, value]) => <div key={label}><strong>{value ?? "—"}</strong><span>{label}</span></div>)}</div>{!summary && <p>Katkı sayıları şu anda yüklenemiyor.</p>}</ModalShell></>;
}
