"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";

type Mode = "verify" | "resend" | "forgot" | "reset";
const config = {
  verify: { path: "/auth/verify-email", title: "E-postanı doğrula", button: "Doğrula" },
  resend: { path: "/auth/resend-verification", title: "Doğrulama e-postasını yeniden gönder", button: "Gönder" },
  forgot: { path: "/auth/forgot-password", title: "Şifreni yenile", button: "Yenileme bağlantısı gönder" },
  reset: { path: "/auth/reset-password", title: "Yeni parola belirle", button: "Parolayı değiştir" },
};

export function AuthActionForm({ mode, initialToken = "" }: { mode: Mode; initialToken?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState(initialToken);
  const [fragmentChecked, setFragmentChecked] = useState(Boolean(initialToken));
  const item = config[mode];

  useEffect(() => {
    if (!["verify", "reset"].includes(mode)) { setFragmentChecked(true); return; }
    if (!token) {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const value = fragment.get("token");
      if (value) {
        setToken(value);
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
    }
    setFragmentChecked(true);
  }, [mode, token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const body = mode === "verify"
      ? { token: data.get("token") }
      : mode === "reset"
        ? { token: data.get("token"), password: data.get("password") }
        : { email: data.get("email") };
    try {
      await apiRequest(item.path, { method: "POST", body: JSON.stringify(body) });
      if (mode === "reset") {
        router.replace("/giris");
        router.refresh();
        return;
      }
      setMessage(mode === "forgot" || mode === "resend" ? "E-posta adresi uygunsa gönderim başlatıldı." : "İşlem tamamlandı.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "İşlem tamamlanamadı.");
    } finally { setBusy(false); }
  }

  const needsToken = ["verify", "reset"].includes(mode);
  return <form className="stack-form" onSubmit={submit}>
    <h1>{item.title}</h1>
    {mode === "forgot" && <p className="auth-recovery-description">Hesabına bağlı e-posta adresini yaz. Şifreni güvenle yenileyebilmen için sana bir bağlantı göndereceğiz.</p>}
    {mode === "reset" && <p className="auth-recovery-description">Yeni şifreni belirle. E-postadaki bağlantıda bulunan güvenlik bilgisi arka planda otomatik olarak kullanılır.</p>}
    {mode === "resend" || mode === "forgot"
      ? <label>E-posta<input name="email" type="email" required autoComplete="email" placeholder="ornek@eposta.com" /></label>
      : token
        ? <input name="token" type="hidden" value={token} />
        : fragmentChecked && <p className="form-error" role="alert">Bu sayfa geçerli bir e-posta bağlantısıyla açılmalı. Yeni bir bağlantı iste.</p>}
    {mode === "reset" && <label>Yeni şifre<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="En az 8 karakter" /></label>}
    {message && <p role="status" className="muted">{message}</p>}
    <button className="button" disabled={busy || (needsToken && !token)}>{busy ? "İşleniyor…" : item.button}</button>
  </form>;
}
