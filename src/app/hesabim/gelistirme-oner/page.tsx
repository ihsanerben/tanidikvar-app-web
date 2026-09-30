import {redirect} from "next/navigation";
import {currentProfile,currentUser} from "@/lib/session";
import {PageTitle} from "@/components/page-title";
import {ContactForm} from "@/components/contact-form";
export const metadata={title:"Geliştirme öner",robots:{index:false,follow:false}};
export default async function SuggestionPage(){
 const user=await currentUser();if(!user)redirect("/giris");
 const profile=await currentProfile();
 const name=[profile?.firstName,profile?.lastName].filter(Boolean).join(" ")||user.email;
 return <section className="content-section suggestion-page"><PageTitle help="Sistemde geliştirilmesini istediğin bir özelliği veya yaşadığın bir sorunu yaz. Nasıl bir değişiklik beklediğini açıklaman bize yardımcı olur.">Geliştirme öner</PageTitle><div className="suggestion-layout"><ContactForm identity={{name,email:user.email}} suggestion/><aside><h2>Doğrudan yaz</h2><p>Önerini e-posta ile de paylaşabilirsin.</p><a href="mailto:tanidikvar@gmail.com">tanidikvar@gmail.com</a></aside></div></section>;
}
