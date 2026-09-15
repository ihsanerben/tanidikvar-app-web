import type { ReactNode } from "react";
import { AccountSectionBackLink } from "@/components/account-section-back-link";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}<AccountSectionBackLink/></>;
}
