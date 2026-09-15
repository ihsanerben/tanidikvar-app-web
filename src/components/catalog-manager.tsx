"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest, apiRequestAllPages } from "@/lib/client-api";

type Kind = "UNIVERSITY" | "DEPARTMENT" | "TAG";
type Item = { id: string; name: string; deletedAt: string | null; version: number };

const turkish = new Intl.Collator("tr", { sensitivity: "base" });
const reason = "Next.js Manager katalog yönetimi.";

export function CatalogManager({ initialKind = "UNIVERSITY", kindLocked = false }: { initialKind?: Kind; kindLocked?: boolean } = {}) {
  const [kind, setKind] = useState<Kind>(initialKind);
  const [data, setData] = useState<Item[] | null>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(() => apiRequestAllPages<Item>(`/manager/catalog/${kind}?includeDeleted=true`)
    .then(items => setData(items.toSorted((a, b) => turkish.compare(a.name, b.name))))
    .catch(error => setMessage(error instanceof Error ? error.message : "Katalog yüklenemedi.")), [kind]);

  useEffect(() => { void load(); }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await apiRequest(`/manager/catalog/${kind}`, { method: "POST", body: JSON.stringify({ name: new FormData(form).get("name"), reason }) });
      form.reset();
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kayıt oluşturulamadı."); }
  }

  async function rename(item: Item) {
    const name = window.prompt("Yeni katalog adı", item.name);
    if (!name || name === item.name) return;
    try {
      await apiRequest(`/manager/catalog/${kind}/${item.id}`, { method: "PUT", body: JSON.stringify({ name, version: item.version, reason }) });
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Ad değiştirilemedi."); }
  }

  async function status(item: Item) {
    try {
      await apiRequest(`/manager/catalog/${kind}/${item.id}/status`, { method: "PUT", body: JSON.stringify({ deleted: item.deletedAt == null, version: item.version, reason }) });
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Durum değiştirilemedi."); }
  }

  return <section className="manager-catalog-records">
    <h2>{kind === "TAG" ? "Tag kayıtları" : "Katalog kayıtları"}</h2>
    {!kindLocked && <label>Katalog türü<select value={kind} onChange={event => setKind(event.target.value as Kind)}><option value="UNIVERSITY">Üniversite</option><option value="DEPARTMENT">Bölüm</option><option value="TAG">Etiket</option></select></label>}
    <form className="stack-form" onSubmit={create}><label>Yeni kayıt adı<input name="name" required minLength={2} maxLength={200} /></label><label>Ekleme gerekçesi<input value={reason} readOnly /></label><button className="button">Ekle</button></form>
    {message && <p role="status">{message}</p>}
    <label>{kind === "TAG" ? "Tag" : "Kayıt"} ara<input type="search" placeholder="Aramaya başla…" onChange={event => { const query = event.currentTarget.value.toLocaleLowerCase("tr"); document.querySelectorAll<HTMLElement>("[data-catalog-name]").forEach(node => { node.hidden = !node.dataset.catalogName?.includes(query); }); }} /></label>
    <h2>Aktif kayıtlar</h2>
    <div className="manager-list manager-catalog-list">{data?.map(item => <article key={item.id} data-catalog-name={item.name.toLocaleLowerCase("tr")}><div><h3>{item.name}</h3><span>{item.deletedAt ? "Pasif" : "Aktif"}</span></div><div className="actions"><button className="button manager-edit-button" onClick={() => rename(item)}>Düzenle</button><button className="button secondary" onClick={() => status(item)}>{item.deletedAt ? "Geri aç" : "Pasife al"}</button></div></article>)}</div>
  </section>;
}
