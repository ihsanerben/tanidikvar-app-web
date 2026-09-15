import type {ReactNode} from "react";
import {ManagerShell} from "@/components/manager-shell";
import {currentUser} from '@/lib/session';
import {redirect} from 'next/navigation';
import {ManagerSessionProvider} from '@/manager-legacy/session-provider';
import '@/manager-legacy/manager.css';
import '@/manager-legacy/additions.css';
export const metadata={robots:{index:false,follow:false}};
export default async function Layout({children}:{children:ReactNode}){const user=await currentUser();if(!user)redirect('/giris');if(user.role!=='MANAGER')redirect('/hesabim');return <ManagerSessionProvider initialUser={user}><ManagerShell>{children}</ManagerShell></ManagerSessionProvider>}
