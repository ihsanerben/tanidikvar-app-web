"use client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui";
export function LoginRequiredButton({children}:{children:string}){const router=useRouter();return <Button type="button" onClick={()=>{if(window.confirm("Bu işlem için giriş yapmanız gerekiyor. Giriş sayfasına gitmek ister misiniz?"))router.push("/giris");}}>{children}</Button>}
