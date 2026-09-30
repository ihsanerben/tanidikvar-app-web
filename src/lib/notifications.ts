export type NotificationTone = "success" | "info" | "warning" | "danger";

export function notify(message: string, tone: NotificationTone = "info", href?: string) {
  window.dispatchEvent(new CustomEvent("app:notification", { detail: { message, tone, href } }));
}

export function actionTone(label: string): NotificationTone | undefined {
  const text = label.toLocaleLowerCase("tr-TR");
  const containsAction = (actions: string) => new RegExp(`(?:^|[^\\p{L}])(?:${actions})(?=$|[^\\p{L}])`, "u").test(text);
  if (containsAction("vazgeç|çıkış|sil|kaldır|gizle|pasifleştir|arşivle|reddet")) return "danger";
  if (containsAction("güncelle|düzenle")) return "warning";
  if (containsAction("kaydet|onayla")) return "info";
  if (containsAction("ekle|yayınla|geri yükle|aktifleştir|kabul et")) return "success";
}

export function mutationNotice(path: string, method: string, body: unknown) {
  if (/\/(like|views|assignment|refresh|login)$/.test(path) || /\/notifications\/[^/]+\/read$/.test(path)) return;
  const data = body && typeof body === "object" ? body as Record<string, unknown> : {};
  if (path.endsWith("/logout")) return notify("Çıkış yapıldı.", "danger");
  if (/\/(remove|archive|revoke|revoke-admin)$/.test(path) || data.deleted === true || data.hidden === true) return notify("Kayıt kaldırıldı.", "danger");
  if (data.deleted === false || data.hidden === false) return notify("Kayıt geri açıldı.", "success");
  if (path.endsWith("/decision")) return notify("Başvuru kararı kaydedildi.", data.status === "REJECTED" ? "danger" : "success");
  if (method === "POST" && /\/(questions|answers|admin-answers)$/.test(path)) return notify("Yayınlandı.", "success");
  if (/catalog|tags/.test(path)) return notify(method === "POST" ? "Kayıt eklendi." : "Kayıt güncellendi.", method === "POST" ? "success" : "warning");
  if (/profile|avatar|account/.test(path)) return notify("Bilgiler kaydedildi.", "info");
  if (method === "PUT") return notify("Değişiklikler güncellendi.", "warning");
  notify("İşlem tamamlandı.", "success");
}
