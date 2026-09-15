"use client";
import NextLink from 'next/link';
import {usePathname,useRouter,useSearchParams as useNextSearchParams,useParams as useNextParams} from 'next/navigation';
import {useCallback,useEffect,type ComponentProps} from 'react';

const routes:Record<string,string>={analytics:'analitik',applications:'basvurular',users:'kullanicilar',content:'icerik',reports:'raporlar',catalog:'katalog',tags:'tagler',actions:'islemler',account:'hesabim',questions:'sorular'};
export function managerHref(to:string){
  if(to.startsWith('/manager'))return to.replace(/^\/manager(?=\/|\?|$)/,'/yonetim').replace(/^\/yonetim\/([^/?]+)/,(_,part:string)=>'/yonetim/'+(routes[part]??part)).replace(/\/applications(?=\?|$)/,'/basvurular');
  if(to==='/account'||to==='/profile')return '/yonetim/hesabim';
  if(to==='/login')return '/giris';
  if(to==='/forgot-password')return '/parolami-unuttum';
  if(to.startsWith('/questions/'))return to.replace('/questions/','/yonetim/sorular/');
  return to;
}
export function Link({to,...props}:Omit<ComponentProps<typeof NextLink>,'href'>&{to:string}){return <NextLink {...props} href={managerHref(to)}/>}
export function useLocation(){const pathname=usePathname(),params=useNextSearchParams();return {pathname,search:params.size?'?'+params.toString():''};}
export function useParams(){return useNextParams<{id:string}>();}
export function useNavigate(){const router=useRouter();return useCallback((to:string,options?:{replace?:boolean})=>{router[options?.replace?'replace':'push'](managerHref(to));},[router]);}
export function Navigate({to,replace=false}:{to:string;replace?:boolean}){const navigate=useNavigate();useEffect(()=>navigate(to,{replace}),[navigate,to,replace]);return null;}
export function useSearchParams():[URLSearchParams,(value:URLSearchParams|Record<string,string>)=>void]{const params=useNextSearchParams(),pathname=usePathname(),router=useRouter();return [new URLSearchParams(params.toString()),value=>{const query=new URLSearchParams(value).toString();router.push(pathname+(query?'?'+query:''));}];}
