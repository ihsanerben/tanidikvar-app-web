import {redirect} from "next/navigation";
import {ProfileForm} from "@/components/profile-form";
import {currentUser} from "@/lib/session";

export const metadata={title:"Profilimi düzenle",robots:{index:false,follow:false}};

export default async function ProfileEditPage(){
 if(!await currentUser())redirect("/giris");
 return <section className="legacy-profile-edit"><h1>Profilim</h1><ProfileForm/></section>;
}
