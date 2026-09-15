import {NextResponse,type NextRequest} from "next/server";

const ACCESS="TV_ACCESS",REFRESH="TV_REFRESH";
type RefreshResult={ok:boolean;setCookies:string[]};
const refreshFlights=new Map<string,Promise<RefreshResult>>();
const protectedPath=(pathname:string)=>pathname==="/soru-sor"||pathname.startsWith("/hesabim")||pathname.startsWith("/yonetim");
function login(request:NextRequest){const url=new URL("/giris",request.url);url.searchParams.set("sonraki",request.nextUrl.pathname+request.nextUrl.search);return NextResponse.redirect(url);}
function accessIsUsable(token:string|undefined){if(!token)return false;try{const part=token.split(".")[1];if(!part)return false;const payload=JSON.parse(atob(part.replace(/-/g,"+").replace(/_/g,"/"))) as {exp?:number};return typeof payload.exp==="number"&&payload.exp>Date.now()/1000+15;}catch{return false;}}
function setCookies(response:Response){const get=(response.headers as Headers&{getSetCookie?:()=>string[]}).getSetCookie;return get?get.call(response.headers):response.headers.get("set-cookie")?[response.headers.get("set-cookie")!]:[];}
function cookiePair(header:string){return header.split(";",1)[0];}
async function rotateSession(cookieHeader:string,refreshToken:string):Promise<RefreshResult>{
 const running=refreshFlights.get(refreshToken);if(running)return running;
 const flight=(async()=>{
  const csrf=await fetch(new URL("/api/auth/csrf",process.env.API_BASE_URL??"http://localhost:8080"),{headers:{Cookie:cookieHeader,Accept:"application/json"},cache:"no-store"});
  if(!csrf.ok)return{ok:false,setCookies:[]};
  const payload=await csrf.json().catch(()=>null) as {token?:unknown}|null;
  if(typeof payload?.token!=="string")return{ok:false,setCookies:[]};
  const csrfCookies=setCookies(csrf),cookie=[cookieHeader,...csrfCookies.map(cookiePair)].filter(Boolean).join("; ");
  const refreshed=await fetch(new URL("/api/auth/refresh",process.env.API_BASE_URL??"http://localhost:8080"),{method:"POST",headers:{Cookie:cookie,Accept:"application/json","X-XSRF-TOKEN":payload.token},cache:"no-store"});
  return{ok:refreshed.ok,setCookies:[...csrfCookies,...setCookies(refreshed)]};
 })().finally(()=>refreshFlights.delete(refreshToken));
 refreshFlights.set(refreshToken,flight);return flight;
}

export async function proxy(request:NextRequest){
  if(accessIsUsable(request.cookies.get(ACCESS)?.value))return NextResponse.next();
  if(!request.cookies.has(REFRESH))return protectedPath(request.nextUrl.pathname)?login(request):NextResponse.next();
  try{
    const refreshed=await rotateSession(request.headers.get("cookie")??"",request.cookies.get(REFRESH)!.value);
    if(!refreshed.ok)return protectedPath(request.nextUrl.pathname)?login(request):NextResponse.next();
    const requestHeaders=new Headers(request.headers);
    const values=new Map(request.cookies.getAll().map(cookie=>[cookie.name,cookie.value]));
    for(const header of refreshed.setCookies){const pair=cookiePair(header),separator=pair.indexOf("=");if(separator>0)values.set(pair.slice(0,separator),pair.slice(separator+1));}
    requestHeaders.set("cookie",[...values].map(([name,value])=>`${name}=${value}`).join("; "));
    const response=NextResponse.next({request:{headers:requestHeaders}});
    for(const header of refreshed.setCookies)response.headers.append("set-cookie",header);
    return response;
  }catch{return protectedPath(request.nextUrl.pathname)?login(request):NextResponse.next();}
}

export const config={matcher:["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]};
