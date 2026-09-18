import type { ReactNode } from "react";
import { AccountSectionBackLink } from "@/components/account-section-back-link";
import {AccountHelp} from "@/components/account-help";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}<AccountHelp/><AccountSectionBackLink/></>;
}
