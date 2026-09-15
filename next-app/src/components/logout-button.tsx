"use client";
import { useRouter } from "next/navigation"; import { apiRequest } from "@/lib/client-api";
import {Button} from "@/components/ui";
export function LogoutButton() { const router = useRouter(); return <Button tone="danger" onClick={async () => { await apiRequest("/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }}>Çıkış yap</Button>; }
