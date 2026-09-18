"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { actionTone, notify, type NotificationTone } from "@/lib/notifications";

type Notice = { id: number; message: string; tone: NotificationTone };

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notice[]>([]);
  const sequence = useRef(0);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    function receive(event: Event) {
      const detail = (event as CustomEvent<Omit<Notice, "id">>).detail;
      const id = ++sequence.current;
      setItems(value => [...value.slice(-3), { ...detail, id }]);
      const timer = setTimeout(() => {
        setItems(value => value.filter(item => item.id !== id));
        timers.delete(timer);
      }, 4200);
      timers.add(timer);
    }
    function cancel(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("button,a") : null;
      if (target?.textContent?.trim() === "Vazgeç" && !target.hasAttribute("disabled")) notify("İşlem iptal edildi.", "danger");
    }
    function closeOutsideMenus(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      document.querySelectorAll<HTMLDetailsElement>("details[data-close-on-outside][open]").forEach(menu => {
        if (!menu.contains(event.target as Node)) menu.open = false;
      });
    }
    function colors() {
      document.querySelectorAll<HTMLButtonElement>("button").forEach(button => {
        if (button.classList.contains("question-save-action")) {
          delete button.dataset.actionTone;
          return;
        }
        const tone = actionTone(button.textContent ?? "");
        if (tone) button.dataset.actionTone = tone;
        else delete button.dataset.actionTone;
      });
    }
    const observer = new MutationObserver(colors);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    colors();
    window.addEventListener("app:notification", receive);
    document.addEventListener("click", cancel);
    document.addEventListener("pointerdown", closeOutsideMenus);
    return () => {
      observer.disconnect();
      window.removeEventListener("app:notification", receive);
      document.removeEventListener("click", cancel);
      document.removeEventListener("pointerdown", closeOutsideMenus);
      timers.forEach(clearTimeout);
    };
  }, []);

  return <>{children}<div className="notification-stack" aria-live="polite" aria-atomic="false">{items.map(item => <div role="status" className={`notification notification-${item.tone}`} key={item.id}>{item.message}</div>)}</div></>;
}
