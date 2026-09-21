"use client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui";
import {confirmDialog} from "@/lib/dialogs";
export function LoginRequiredButton({children}:{children:string}){const router=useRouter();return <Button type="button" onClick={()=>void confirmDialog("Bu işlem için giriş yapmanız gerekiyor.",{title:"Üyelik gerekiyor",confirmLabel:"Giriş yap"}).then(confirmed=>{if(confirmed)router.push("/giris")})}>{children}</Button>}
