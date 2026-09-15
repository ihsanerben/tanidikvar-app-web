"use client";
import {useState,type ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import type {CurrentUser} from '@/lib/session';
import {ManagerSessionContext} from './features/auth/useAuth';
import {apiGet,authPost} from './api/apiClient';
export function ManagerSessionProvider({initialUser,children}:{initialUser:CurrentUser;children:ReactNode}){
 const [user,setUser]=useState<CurrentUser|null>(initialUser),router=useRouter();
 async function reload(){const current=await apiGet('/api/me') as CurrentUser;setUser(current);router.refresh();}
 async function logout(){await authPost('/api/auth/logout');setUser(null);router.replace('/giris');router.refresh();}
 return <ManagerSessionContext.Provider value={{user,status:'ready',setUser,reload,logout}}>{children}</ManagerSessionContext.Provider>;
}
