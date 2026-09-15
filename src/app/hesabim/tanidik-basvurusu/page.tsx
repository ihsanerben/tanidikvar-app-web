import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { TanidikApplications } from "@/components/tanidik-applications";

export const metadata={title:"Tanıdık başvurularım",robots:{index:false,follow:false}};

export default async function Page(){
  if(!await currentUser())redirect("/giris");
  return <TanidikApplications/>;
}
