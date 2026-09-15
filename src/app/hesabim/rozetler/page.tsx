import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { AchievementShowcase } from "@/components/achievement-showcase";
import { AchievementHelp } from "@/components/achievement-help";

export const metadata={title:"Rozet vitrini",robots:{index:false,follow:false}};

export default async function Page(){
  const user=await currentUser();
  if(!user)redirect("/giris");
  return <section className="legacy-account-page achievement-page"><Link href="/hesabim">← Hesabıma dön</Link><div className="account-title-with-help"><h1>Rozet vitrini</h1><AchievementHelp/></div><div className="legacy-account-details"><AchievementShowcase userId={user.id}/></div></section>;
}
