import { SystemStatus } from "@/components/system-status";

export const metadata = { title: "Sistem durumu", robots: { index: false, follow: false } };

export default function StatusPage() { return <SystemStatus/>; }
