"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const hasOwnBottomLink = new Set([
  "/hesabim/profil",
  "/hesabim/tanidik-yorumlarim",
  "/hesabim/topluluk-yorumlarim",
  "/hesabim/yorumlarim",
]);

export function AccountSectionBackLink() {
  const pathname = usePathname();
  if (pathname === "/hesabim" || hasOwnBottomLink.has(pathname)) return null;
  return <div className="account-global-back"><Link className="button secondary" href="/hesabim">Hesabıma dön</Link></div>;
}
