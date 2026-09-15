"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "loading" | "ready" | "error";

export function SystemStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    fetch("/api/backend/health", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const value = await response.json() as { status?: string; database?: string };
        if (!response.ok || value.status !== "ok" || value.database !== "up") throw new Error("unhealthy");
        if (active) setStatus("ready");
      })
      .catch(() => { if (active) setStatus("error"); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [attempt]);
  return <section className="status-page">
    <h1>Sistem durumu</h1>
    <div className="status-card" role="status" aria-live="polite"><span className={`status-dot ${status}`} aria-hidden="true"/>
      {status === "loading" && <p>Bağlantı kontrol ediliyor…</p>}
      {status === "ready" && <div><h2>Bağlantı hazır</h2><p>Uygulama ve veritabanı yanıt veriyor.</p></div>}
      {status === "error" && <div><h2>Şu anda bağlantı kurulamıyor</h2><p>Biraz sonra tekrar deneyebilirsin.</p></div>}
    </div>
    <button className="button" disabled={status === "loading"} onClick={() => { setStatus("loading"); setAttempt(value => value + 1); }}>Tekrar kontrol et</button>
    <Link className="text-link" href="/">Ana sayfaya dön →</Link>
  </section>;
}
