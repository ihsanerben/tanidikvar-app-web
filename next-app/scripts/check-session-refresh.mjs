import {createServer} from 'node:http';
import {spawn} from 'node:child_process';

const csrf='csrf-test-token',oldRefresh='old-refresh',newRefresh='new-refresh',newAccess='new-access';
let csrfCalls=0,refreshCalls=0,meCalls=0;
const backend=createServer((request,response)=>{
 const cookie=request.headers.cookie??'';
 response.setHeader('Content-Type','application/json');
 if(request.url==='/api/auth/csrf'){
  csrfCalls++;
  response.setHeader('Set-Cookie',`XSRF-TOKEN=${csrf}; Path=/; SameSite=Lax`);
  response.end(JSON.stringify({token:csrf,headerName:'X-XSRF-TOKEN'}));return;
 }
 if(request.url==='/api/auth/refresh'){
  refreshCalls++;
  if(request.headers['x-xsrf-token']!==csrf||!cookie.includes(`XSRF-TOKEN=${csrf}`)||!cookie.includes(`TV_REFRESH=${oldRefresh}`)){
   response.statusCode=403;response.end(JSON.stringify({code:'ACCESS_DENIED'}));return;
  }
  response.setHeader('Set-Cookie',[`TV_ACCESS=${newAccess}; Path=/; HttpOnly; SameSite=Lax`,`TV_REFRESH=${newRefresh}; Path=/; HttpOnly; SameSite=Lax`]);
  response.end(JSON.stringify({id:'manager-id',email:'manager@example.test',role:'MANAGER',profileCompleted:true}));return;
 }
 if(request.url==='/api/me'){
  meCalls++;
  if(!cookie.includes(`TV_ACCESS=${newAccess}`)){response.statusCode=401;response.end('{}');return;}
  response.end(JSON.stringify({id:'manager-id',email:'manager@example.test',role:'MANAGER',profileCompleted:true}));return;
 }
 if(request.url==='/api/manager/statistics'){
  response.end(JSON.stringify({activeUsers:1,disabledUsers:0,activeAdmins:0,pendingApplications:0,activeQuestions:0,archivedQuestions:0,hiddenQuestions:0,communityAnswers:0,adminAnswers:0,likes:0,views:0}));return;
 }
 response.statusCode=404;response.end('{}');
});
await new Promise(resolve=>backend.listen(0,'127.0.0.1',resolve));
const api=`http://127.0.0.1:${backend.address().port}`;
const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3131'],{env:{...process.env,API_BASE_URL:api},stdio:'pipe'});
const logs=[];next.stdout.on('data',chunk=>logs.push(String(chunk)));next.stderr.on('data',chunk=>logs.push(String(chunk)));
try{
 let ready=false;for(let attempt=0;attempt<100;attempt++){try{await fetch('http://localhost:3131/giris');ready=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}}
 if(!ready)throw new Error('Next başlamadı: '+logs.join(''));
 const expiredPayload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)-60})).toString('base64url');
 const cookie=`TV_ACCESS=x.${expiredPayload}.x; TV_REFRESH=${oldRefresh}`;
 const responses=await Promise.all([fetch('http://localhost:3131/yonetim',{headers:{Cookie:cookie},redirect:'manual'}),fetch('http://localhost:3131/yonetim',{headers:{Cookie:cookie},redirect:'manual'})]);
 if(responses.some(response=>response.status!==200))throw new Error('Korunan sayfa açılamadı: '+responses.map(response=>response.status).join(','));
 if(csrfCalls!==1||refreshCalls!==1)throw new Error(`Yenileme tekilleşmedi: csrf=${csrfCalls} refresh=${refreshCalls}`);
 if(meCalls!==2)throw new Error(`Yenilenen access cookie sayfa renderına ulaşmadı: me=${meCalls}`);
 for(const response of responses){const cookies=response.headers.getSetCookie();if(!cookies.some(value=>value.startsWith(`TV_ACCESS=${newAccess}`))||!cookies.some(value=>value.startsWith(`TV_REFRESH=${newRefresh}`)))throw new Error('Yenilenen cookie tarayıcı yanıtına eklenmedi.');}
 console.log(`PASS csrf=${csrfCalls} refresh=${refreshCalls} protected=${responses.length} me=${meCalls}`);
}finally{next.kill('SIGTERM');backend.close();}
