import { render } from '../../test/render'
import { screen,fireEvent,waitFor,act,within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { App } from '../../app/App'
const manager={id:'manager',email:'manager@example.test',role:'MANAGER',profileCompleted:false}
const user={id:'member',email:'member@example.test',name:'Ada Yılmaz',authority:'ADMIN',educationStatus:'UNIVERSITE_OGRENCISI',universityName:'Üniversite',departmentName:'Bölüm',emailVerified:true,createdAt:'2026-09-05T10:00:00Z',deletedAt:null,version:3}
const content={id:'question',kind:'QUESTION',questionId:'question',authorId:'member',title:'Üniversitede yaşam nasıl?',body:'Yazarın korunacak soru metni',authorName:'Ada Yılmaz',createdAt:'2026-09-05T10:00:00Z',deletedAt:'2026-09-06T10:00:00Z',moderatedAt:'2026-09-06T10:00:00Z',archivedAt:null,questionHidden:false,viewCount:1,likeCount:2,communityAnswerCount:3,adminAnswerCount:4,version:2}
const classification={scope:'GENERAL',universityId:null,universityDepartmentId:null,tagIds:[],version:2,education:null}
const stats={activeUsers:12,disabledUsers:2,activeAdmins:3,pendingApplications:1,activeQuestions:10,archivedQuestions:2,hiddenQuestions:1,communityAnswers:20,adminAnswers:5,likes:100,views:15000}
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status})
const list=(items:unknown[])=>({items,page:0,size:20,totalElements:items.length})
const application={id:'application',applicantId:'member',firstName:'Ada',lastName:'Yılmaz',educationStatus:'UNIVERSITE_OGRENCISI',universityName:'Üniversite',departmentName:'Bölüm',graduationYear:null,occupation:null,company:null,status:'PENDING',submittedAt:'2026-09-05T10:00:00Z',reviewedBy:null,reviewedAt:null,rejectionReason:null,version:0,activeVerification:false}
function show(path:string){return render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>)}
beforeEach(()=>setUser(manager))
afterEach(()=>vi.unstubAllGlobals())
it('shows only a prominent login action in the guest header while keeping registration in the login form',()=>{
 setUser(null);show('/login');const account=screen.getByRole('navigation',{name:'Hesap'});const login=within(account).getByRole('link',{name:'Giriş yap'});expect(login).toHaveAttribute('href','/login');expect(login).toHaveClass('button');expect(within(account).queryByRole('link',{name:'Kayıt ol'})).not.toBeInTheDocument();expect(screen.getByText('Henüz hesabın yok mu?')).toBeVisible();expect(screen.getByRole('link',{name:'Kayıt ol'})).toHaveAttribute('href','/register')
})
it('routes manager login and public navigation into the management workspace',async()=>{
 const fetch=vi.fn(async(url:string)=>url.endsWith('/statistics')?json(stats):json(list([])));vi.stubGlobal('fetch',fetch);show('/login');await screen.findByRole('heading',{name:'Platforma genel bakış'});expect(screen.getByRole('navigation',{name:'Yönetim menüsü'})).toBeVisible();expect(screen.queryByRole('navigation',{name:'Ana menü'})).not.toBeInTheDocument();for(const name of ['Özet','Başvurular','Kullanıcılar','Sorular ve Yorumlar','Üniversiteler ve Bölümler','Tagler','İşlem Geçmişi','Hesabım'])expect(within(screen.getByRole('navigation',{name:'Yönetim menüsü'})).getByRole('link',{name})).toBeInTheDocument()
})
it('mobile menu closes on Escape and restores the toggle focus',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/statistics')?json(stats):json(list([]))));show('/manager');const menu=screen.getByRole('button',{name:'Menü'});fireEvent.click(menu);expect(menu).toHaveAttribute('aria-expanded','true');fireEvent.keyDown(window,{key:'Escape'});expect(menu).toHaveAttribute('aria-expanded','false');expect(menu).toHaveFocus()
})
it('manager account saves identity without education or contribution actions',async()=>{
 const fetch=vi.fn(async(url:string,o:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):url.endsWith('/avatar')?json({fileId:null}):json({firstName:'Deniz',lastName:'Yönetici',email:manager.email,version:o.method==='PUT'?2:1}));vi.stubGlobal('fetch',fetch);show('/account');await screen.findByLabelText('Ad');for(const name of ['Üniversite','Bölüm','Eğitim durumu'])expect(screen.queryByLabelText(name)).not.toBeInTheDocument();expect(screen.queryByRole('link',{name:'Sorularım'})).not.toBeInTheDocument();fireEvent.change(screen.getByLabelText('Ad'),{target:{value:'Deniz'}});fireEvent.click(screen.getByRole('button',{name:'Bilgilerimi kaydet'}));await screen.findByText('Bilgiler kaydedildi.');const call=fetch.mock.calls.find(([,o])=>o.method==='PUT')!;expect(JSON.parse(call[1].body as string)).toEqual({firstName:'Deniz',lastName:'Yönetici',version:1})
})
it('question review shows hidden question and both answer types without recording a view',async()=>{
 const fetch=vi.fn(async(url:string)=>url.includes('/manager/questions/')?json({question:content,classification,answers:list([{...content,id:'community',kind:'COMMUNITY',body:'Topluluk katkısı',questionHidden:true},{...content,id:'admin',kind:'ADMIN',body:'Doğrulanmış katkı',questionHidden:true}])}):json(list([])));vi.stubGlobal('fetch',fetch);show('/questions/question');await screen.findByText(content.body);expect(screen.getByText('Topluluk katkısı')).toBeVisible();expect(screen.getByText('Doğrulanmış katkı')).toBeVisible();expect(fetch.mock.calls.some(([url])=>url.includes('/views'))).toBe(false);expect(screen.queryByRole('button',{name:'Beğen'})).not.toBeInTheDocument()
})
it('question editing sends text and retains the form on a stale version',async()=>{
 const fetch=vi.fn(async(url:string,o:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):o.method==='PUT'?json({code:'STALE_VERSION'},409):url.includes('/manager/questions/')?json({question:content,classification,answers:list([])}):json(list([])));vi.stubGlobal('fetch',fetch);show('/manager/questions/question');fireEvent.click(await screen.findByRole('button',{name:'Düzenle'}));fireEvent.change(await screen.findByLabelText('Düzeltme gerekçesi'),{target:{value:'Sınıflandırma incelendi'}});fireEvent.click(screen.getByRole('button',{name:'Soruyu kaydet'}));await screen.findByRole('button',{name:'Güncel soruyu yükle'});expect(screen.getByLabelText('Düzeltme gerekçesi')).toHaveValue('Sınıflandırma incelendi');const body=JSON.parse(fetch.mock.calls.find(([,o])=>o.method==='PUT')![1].body as string);expect(body).toEqual({...classification,education:undefined,title:content.title,body:content.body,reason:'Sınıflandırma incelendi'});expect(screen.getByLabelText('Soru başlığı')).toHaveValue(content.title);expect(screen.getByLabelText('Soru açıklaması')).toHaveValue(content.body)
})
it('user detail revokes only the current verification with a required reason',async()=>{
 const detail={user,universityName:'Üniversite',departmentName:'Bölüm',graduationYear:null,avatarFileId:null,biography:null,occupation:null,company:null,linkedinUrl:null,portfolioUrl:null,verificationId:'verification',questions:2,communityAnswers:3,adminAnswers:4}
 const fetch=vi.fn(async(url:string,o:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):o.method==='POST'?new Response(null,{status:204}):url.includes('/applications')?json(list([])):json(detail));vi.stubGlobal('fetch',fetch);show('/manager/users/member');fireEvent.click(await screen.findByRole('button',{name:'Admin yetkisini kaldır'}));const confirm=screen.getByRole('button',{name:'Admin yetkisini kaldır — onayla'});expect(confirm).toBeDisabled();fireEvent.change(screen.getByLabelText('İşlem gerekçesi'),{target:{value:'Belge doğrulaması kaldırıldı'}});fireEvent.click(confirm);await waitFor(()=>expect(fetch.mock.calls.some(([,o])=>o.method==='POST')).toBe(true));expect(JSON.parse(fetch.mock.calls.find(([,o])=>o.method==='POST')![1].body as string)).toEqual({verificationId:'verification',reason:'Belge doğrulaması kaldırıldı'})
})
it('application detail shows profile review and history without a document preview',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.includes('/users/')?json(list([application])):json(application)));show('/manager/applications/application');expect(await screen.findByRole('heading',{name:'Başvuru geçmişi'})).toBeVisible();expect(screen.queryByTitle('Başvuru belgesi')).not.toBeInTheDocument();expect(screen.queryByText('Gönderilen belge')).not.toBeInTheDocument()
})
it('shows catalog impact and requires a reason before changing status',async()=>{
 const entry={id:'uni',name:'Örnek Üniversitesi',deletedAt:null,version:0}
 const fetch=vi.fn(async(url:string,o:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):url.includes('/catalog-usage/')?json({profiles:3,questions:4}):o.method==='PUT'?json({...entry,deletedAt:'2026-09-06',version:1}):json(list([entry])))
 vi.stubGlobal('fetch',fetch);show('/manager/catalog?tab=UNIVERSITY')
 fireEvent.click(await screen.findByRole('button',{name:'Pasife al'}))
 await screen.findByText('3 bağlı profil · 4 bağlı soru')
 expect(fetch.mock.calls.some(([,o])=>o.method==='PUT')).toBe(false)
 fireEvent.click(screen.getByRole('button',{name:'Kaydı pasifleştir'}))
 fireEvent.change(screen.getByLabelText('İşlem gerekçesi',{selector:'textarea'}),{target:{value:'Katalog incelemesi'}})
 fireEvent.click(screen.getByRole('button',{name:'Kaydı pasifleştir — onayla'}))
 await waitFor(()=>expect(fetch.mock.calls.some(([,o])=>o.method==='PUT')).toBe(true))
 expect(JSON.parse(fetch.mock.calls.find(([,o])=>o.method==='PUT')![1].body as string)).toMatchObject({version:0,reason:'Katalog incelemesi',deleted:true})
})
it('action detail identifies the actor, target and recorded reason',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>json({actorName:'Deniz Yönetici',action:{id:'action',actorId:'manager',action:'CLASSIFY_QUESTION',targetType:'QUESTION',targetId:'question',reason:'Yanlış kapsam düzeltildi',occurredAt:'2026-09-06T10:00:00Z'}})));show('/manager/actions/action');expect(await screen.findByText('Yanlış kapsam düzeltildi')).toBeVisible();expect(screen.getByRole('link',{name:'Deniz Yönetici'})).toHaveAttribute('href','/manager/users/manager')
})
it('pending private detail cannot survive an account change',async()=>{
 let resolve:((r:Response)=>void)|undefined;vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(r=>{resolve=r})));show('/manager/users/member');await act(async()=>setUser({...manager,id:'normal',role:'USER'}));resolve?.(json({user,universityName:null,departmentName:null,graduationYear:null,avatarFileId:null,biography:null,occupation:null,company:null,linkedinUrl:null,portfolioUrl:null,verificationId:null,questions:0,communityAnswers:0,adminAnswers:0}));await waitFor(()=>expect(screen.queryByText(user.email)).not.toBeInTheDocument())
})
