// Isolated UI acceptance: both applications use the same in-memory API fixtures.
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(path.resolve('../package.json'));
const {chromium}=require('@playwright/test');
const stamp='2026-09-14T10:00:00Z';
const id='10000000-0000-4000-8000-000000000001';
const uid='20000000-0000-4000-8000-000000000002';
const manager={id,email:'manager@example.test',role:'MANAGER',profileCompleted:true};
const user={id:uid,email:'deniz@example.test',name:'Deniz Yılmaz',authority:'TANIDIK',educationStatus:'UNIVERSITE_OGRENCISI',universityName:'Ege Üniversitesi',departmentName:'Bilgisayar Mühendisliği',emailVerified:true,createdAt:stamp,lastLoginAt:stamp,deletedAt:null,version:0};
const question={id,kind:'QUESTION',questionId:id,authorId:uid,title:'Bilgisayar mühendisliğinde ilk yıl nasıl geçiyor?',body:'Dersler ve kampüs yaşamı hakkında deneyimlerinizi merak ediyorum.',authorName:user.name,questionAuthorId:uid,questionAuthorName:user.name,createdAt:stamp,deletedAt:null,moderatedAt:null,archivedAt:null,questionHidden:false,viewCount:42,likeCount:8,communityAnswerCount:1,adminAnswerCount:1,version:0};
const answer={...question,id:uid,kind:'TANIDIK',authorName:'Ece Demir',body:'İlk yıl temel dersler yoğun olsa da öğrenci kulüpleriyle denge kurabilirsin.'};
const application={id,applicantId:uid,firstName:'Deniz',lastName:'Yılmaz',educationStatus:user.educationStatus,universityName:user.universityName,departmentName:user.departmentName,graduationYear:null,occupation:null,company:null,coverLetter:'Üniversitemdeki deneyimlerimi adaylarla paylaşmak istiyorum.',status:'PENDING',submittedAt:stamp,reviewedBy:null,reviewedAt:null,rejectionReason:null,version:0,activeVerification:false};
const entry={id,name:'Ege Üniversitesi',city:'İzmir',institutionType:'DEVLET',deletedAt:null,version:0};
const action={id,actorId:id,action:'QUESTION_UPDATED',targetType:'QUESTION',targetId:id,reason:'Soru başlığı anlaşılır hale getirildi.',occurredAt:stamp};
const page=items=>({items,page:0,size:20,totalElements:items.length});
const stats=Object.fromEntries(['activeUsers','disabledUsers','activeAdmins','pendingApplications','activeQuestions','archivedQuestions','hiddenQuestions','communityAnswers','adminAnswers','likes','views'].map((key,i)=>[key,(i+1)*7]));
const metrics=Object.fromEntries(['users','questions','communityAnswers','adminAnswers','views','likes','applications','approvedApplications','rejectedApplications'].map((key,i)=>[key,i+3]));
const mutations=[];
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost'),p=url.pathname;
 res.setHeader('Content-Type','application/json');res.setHeader('Access-Control-Allow-Origin',req.headers.origin??'http://localhost:5178');res.setHeader('Access-Control-Allow-Credentials','true');res.setHeader('Access-Control-Allow-Headers','content-type,x-xsrf-token');
 if(req.method==='OPTIONS'){res.end();return;}
 let data;
 if(req.method!=='GET'){let body='';for await(const chunk of req)body+=chunk;mutations.push({path:p,method:req.method,body:body?JSON.parse(body):null});data=p.includes('/account')?{firstName:'Test',lastName:'Yönetici',email:manager.email,version:1}:p.includes('/classification')?{scope:'GENERAL',universityId:null,departmentId:null,tagIds:[],version:1}:p.includes('/content/')?{...answer,version:1}:{};}
 else if(p==='/api/me')data=manager;
 else if(p==='/api/me/profile')data={firstName:'Test',lastName:'Yönetici',educationStatus:null};
 else if(p==='/api/auth/csrf')data={token:'fixture-csrf'};
 else if(p==='/api/manager/account')data={firstName:'Test',lastName:'Yönetici',email:manager.email,version:0};
 else if(p.endsWith('/statistics'))data=stats;
 else if(p.endsWith('/analytics'))data={dateFrom:'2026-08-17',dateTo:'2026-09-15',timezone:'Europe/Istanbul',totals:metrics,points:[{date:'2026-09-13',...metrics},{date:'2026-09-14',...metrics}]};
 else if(p==='/api/manager/users')data=page([user]);
 else if(p.endsWith('/applications'))data=page([application]);
 else if(p==='/api/manager/users/'+uid)data={user,firstName:'Deniz',lastName:'Yılmaz',universityId:id,universityName:user.universityName,departmentId:id,departmentName:user.departmentName,graduationYear:null,avatarFileId:null,biography:'Kampüs ve yazılım kulüplerinde gönüllüyüm.',occupation:null,company:null,linkedinUrl:null,portfolioUrl:null,verificationId:id,questions:4,communityAnswers:8,adminAnswers:3};
 else if(p.endsWith('/tanidik-applications')||p.endsWith('/admin-applications'))data=page([application]);
 else if(p.includes('/tanidik-applications/')||p.includes('/admin-applications/'))data=application;
 else if(p==='/api/manager/content')data=page([url.searchParams.get('kind')==='QUESTION'||!url.searchParams.get('kind')?question:answer]);
 else if(p==='/api/manager/questions/'+id)data={question,classification:{scope:'GENERAL',universityId:null,departmentId:null,tagIds:[],version:0},answers:page([answer])};
 else if(p==='/api/manager/actions')data=page([action]);
 else if(p==='/api/manager/actions/'+id)data={action,actorName:'Test Yönetici'};
 else if(p.endsWith('/reports'))data=page([{id,questionId:id,questionTitle:question.title,questionAuthorId:uid,questionAuthorName:user.name,reporterId:uid,reporterName:'Ece Demir',reason:'Yanıltıcı bir bilgi olabilir; incelenmesini rica ediyorum.',status:'OPEN',createdAt:stamp,version:0}]);
 else if(p.endsWith('/education-verifications'))data=page([{id,applicantName:'Ece Demir',evidence:'Mezuniyet kanıtı inceleme örneği.',status:'PENDING',reason:null,version:0}]);
 else if(p.includes('/catalog-usage/'))data={profiles:0,questions:0};
 else if(p.includes('/catalog/')||p==='/api/universities'||p==='/api/tags'||p==='/api/departments')data=page([{...entry,name:p.includes('TAG')||p.endsWith('/tags')?'Kampüs':p.includes('DEPARTMENT')||p.endsWith('/departments')?'Bilgisayar Mühendisliği':entry.name}]);
 else {res.statusCode=404;data={code:'NOT_FOUND',message:p};}
 res.end(JSON.stringify(data));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const api='http://127.0.0.1:'+server.address().port;
const artifacts=await mkdtemp(path.join(tmpdir(),'manager-parity-'));
const next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3127'],{env:{...process.env,API_BASE_URL:api},stdio:'pipe'});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--port','5178','--strictPort'],{cwd:path.resolve('..'),env:{...process.env,VITE_API_BASE_URL:api},stdio:'pipe'});
const logs=[];for(const proc of [next,vite]){proc.stdout.on('data',chunk=>logs.push(String(chunk)));proc.stderr.on('data',chunk=>logs.push(String(chunk)));}
let browser;
try{
 for(const origin of ['http://localhost:3127','http://localhost:5178']){let ready=false;for(let n=0;n<100;n++){try{await fetch(origin);ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}if(!ready)throw new Error('Server not ready: '+origin+' '+logs.join(''));}
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext();
 const token='fixture.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.fixture';
 await context.addCookies([{name:'TV_ACCESS',value:token,domain:'localhost',path:'/'}]);
 const tab=await context.newPage(),errors=[];tab.on('pageerror',error=>errors.push(error.message));
 const screens=[['','', '.management-stats'],['users','kullanicilar','.managed-user-card'],['content','icerik','.manager-content-card'],['analytics','analitik','.analytics-grid'],['reports','raporlar','.manager-report-card'],['applications','basvurular','.application-card'],['catalog','katalog','.catalog-list'],['tags','tagler','.catalog-list'],['actions','islemler','.question-card'],['account','hesabim','.manager-account-grid'],['users/'+uid,'kullanicilar/'+uid,'.manager-user-detail'],['applications/'+id,'basvurular/'+id,'.application-card'],['questions/'+id,'sorular/'+id,'.manager-moderated-record'],['actions/'+id,'islemler/'+id,'.account-summary'],['users/'+uid+'/applications','kullanicilar/'+uid+'/basvurular','.manager-record-list']];
 const report=[];
 for(const width of [1440,390]){await tab.setViewportSize({width,height:1000});for(const [oldRoute,newRoute,selector] of screens){const name=(newRoute||'ozet').replaceAll('/','-');for(const [version,origin,route] of [['old','http://localhost:5178','/manager'+(oldRoute?'/'+oldRoute:'')],['next','http://localhost:3127','/yonetim'+(newRoute?'/'+newRoute:'')]]){await tab.goto(origin+route);await tab.locator(selector).first().waitFor({timeout:15000});await tab.screenshot({path:path.join(artifacts,`${version}-${width}-${name}.png`),fullPage:true});const geometry=await tab.locator(selector).first().evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {width:r.width,padding:s.padding,borderRadius:s.borderRadius,fontSize:s.fontSize,background:s.backgroundColor};});const overflow=await tab.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)throw new Error('Horizontal overflow: '+version+' '+width+' '+route);report.push({version,width,route,geometry});}console.log('PASS '+width+' '+name);}}
 await tab.setViewportSize({width:1440,height:1000});await tab.goto('http://localhost:3127/yonetim/kullanicilar');await tab.locator('select[name="authority"]').selectOption('TANIDIK');await tab.getByRole('button',{name:'Filtrele',exact:true}).click();await tab.waitForURL(/authority=TANIDIK/);await tab.locator('.managed-user-card').waitFor();
 await tab.goto('http://localhost:3127/yonetim/sorular/'+id);await tab.locator('.manager-card-menu summary').first().click();await tab.getByRole('button',{name:'Düzenle',exact:true}).first().click();await tab.getByRole('dialog').waitFor();await tab.screenshot({path:path.join(artifacts,'next-edit-dialog.png')});await tab.keyboard.press('Escape');await tab.getByRole('dialog').waitFor({state:'hidden'});
 await tab.locator('.manager-card-menu').first().getByRole('button',{name:'Düzenle',exact:true}).click();await tab.locator('#review-title').fill('Yeni soru başlığı ve kampüs deneyimi');await tab.locator('#classification-reason').fill('Başlığın açıklığını iyileştirmek için düzenleme.');await tab.getByRole('button',{name:'Soruyu kaydet',exact:true}).click();await tab.getByRole('dialog').waitFor({state:'hidden'});
 if(!mutations.some(item=>item.path===`/api/manager/questions/${id}/classification`&&item.body.version===0&&item.body.reason==='Başlığın açıklığını iyileştirmek için düzenleme.'))throw new Error('Question edit lost reason/version');
 await tab.locator('.manager-card-menu summary').last().click();await tab.locator('.manager-card-menu').last().getByRole('button',{name:'Düzenle',exact:true}).click();await tab.locator('#manager-comment-body').fill('Güncellenen yorum metni ve öğrencilik deneyimi.');await tab.locator('#manager-comment-reason').fill('Yorumdaki yazım hatasını düzeltme.');await tab.getByRole('button',{name:'Yorumu kaydet',exact:true}).click();await tab.getByRole('dialog').waitFor({state:'hidden'});
 if(!mutations.some(item=>item.path===`/api/manager/content/TANIDIK/${uid}`&&item.body.version===0))throw new Error('Tanidik edit endpoint mismatch');
 await tab.setViewportSize({width:390,height:844});await tab.getByRole('button',{name:'Menü',exact:true}).click();await tab.locator('#manager-sidebar').waitFor({state:'visible'});await tab.keyboard.press('Escape');if(await tab.getByRole('button',{name:'Menü',exact:true}).getAttribute('aria-expanded')!=='false')throw new Error('Mobile menu Escape failed');
 if(errors.length)throw new Error('Browser errors: '+errors.join('\n'));
 const anonymous=await browser.newContext();const guest=await anonymous.newPage();await guest.goto('http://localhost:3127/yonetim');if(!guest.url().includes('/giris'))throw new Error('Guest Manager route was not protected');await anonymous.close();
 await writeFile(path.join(artifacts,'report.json'),JSON.stringify({report,mutations,errors},null,2));console.log('ARTIFACTS '+artifacts);
}finally{await browser?.close();next.kill('SIGTERM');vite.kill('SIGTERM');server.close();}
