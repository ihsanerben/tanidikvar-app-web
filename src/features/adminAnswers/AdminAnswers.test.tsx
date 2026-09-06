import { render,screen,fireEvent,waitFor,act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { AdminAnswerSection } from './AdminAnswerSection'
import { AdminAnswerCard } from './AdminAnswerCard'
import type { AdminAnswer } from './adminAnswerApi'
const original:AdminAnswer={id:'answer',questionId:'question',questionTitle:'Üniversitede eğitim nasıl?',authorId:'admin',authorName:'Ada Yılmaz',activeAdmin:true,universityName:'Eski Üniversite',departmentName:'Bilgisayar',educationStatus:'UNIVERSITE_OGRENCISI',graduationYear:null,avatarFileId:null,occupation:null,company:null,body:'Üniversitede edindiğim gerçek deneyim.',publishedAt:'2026-09-05T10:00:00Z',editedAt:null,deletedAt:null,moderatedAt:null,version:0}
const initialAssignment={questionId:'question',questionTitle:original.questionTitle,assigned:false,version:0,assignedAt:null,archivedAt:null}
const quota={activeAdmin:true,day:'2026-09-05',used:0,limit:5,remaining:5,resetsAt:'2026-09-05T21:00:00Z'}
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status})
const list=(items:unknown[]=[])=>json({items,page:0,size:10,totalElements:items.length})
beforeEach(()=>setUser({id:'admin',email:'test@example.test',role:'ADMIN',profileCompleted:true}))
afterEach(()=>vi.unstubAllGlobals())
function section(archived=false){return render(<MemoryRouter><AdminAnswerSection questionId="question" archived={archived}/></MemoryRouter>)}
it('shows anonymous readers verified safe text and historical education without private controls',async()=>{
 setUser(null);vi.stubGlobal('fetch',vi.fn(async()=>list([{...original,body:'<script>alert(1)</script>'}])));section()
 expect(await screen.findByText('<script>alert(1)</script>')).toBeVisible();expect(document.querySelector('script')).toBeNull()
 expect(screen.getByRole('button',{name:'Ada Yılmaz profilini görüntüle'})).toBeVisible()
 expect(screen.getByText(/ilk yayınındaki doğrulama/)).toBeVisible();expect(screen.queryByRole('button',{name:'Cevaplayacağım'})).not.toBeInTheDocument()
})
it('assigns before publishing, uses CSRF and displays remaining quota',async()=>{
 let assigned=false,saved=false
 const fetch=vi.fn(async(url:string,o:RequestInit)=>{
  if(url.endsWith('/csrf'))return json({token:'csrf'})
  if(url.endsWith('/admin-quota'))return json({...quota,remaining:saved?4:5,used:saved?1:0})
  if(url.endsWith('/assignment')){assigned=true;return json({...initialAssignment,assigned:true,version:1})}
  if(url.endsWith('/my-admin-answer'))return json({answer:saved?original:null,assignment:{...initialAssignment,assigned,version:assigned?1:0}})
  if(o.method==='POST'){saved=true;return json(original,201)}
  return list(saved?[original]:[])
 });vi.stubGlobal('fetch',fetch);section()
 fireEvent.click(await screen.findByRole('button',{name:'Cevaplayacağım'}))
 fireEvent.change(await screen.findByLabelText('Admin cevabın'),{target:{value:original.body}})
 fireEvent.click(screen.getByRole('button',{name:'Admin cevabını yayınla'}))
 await screen.findByRole('button',{name:'Admin cevabımı düzenle'});await screen.findByText(/Kalan cevap hakkın: 4 \/ 5/)
 expect(fetch.mock.calls.find(([,o])=>o.method==='POST')?.[1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
})
it('quota exhaustion prevents a new editor but does not block assignment cancellation',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/admin-quota')?json({...quota,used:5,remaining:0}):url.endsWith('/my-admin-answer')?json({answer:null,assignment:{...initialAssignment,assigned:true,version:1}}):list()));section()
 expect(await screen.findByText(/Bugünkü beş farklı soru hakkını kullandın/)).toBeVisible()
 expect(screen.queryByLabelText('Admin cevabın')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Atamayı iptal et'})).toBeVisible()
})
it('existing answers can be edited with no quota or assignment and keep drafts on stale errors',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string,o:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):o.method==='PUT'?json({code:'STALE_VERSION'},409):url.endsWith('/admin-quota')?json({...quota,used:5,remaining:0}):url.endsWith('/my-admin-answer')?json({answer:original,assignment:initialAssignment}):list([original])))
 section();fireEvent.click(await screen.findByRole('button',{name:'Admin cevabımı düzenle'}))
 fireEvent.change(screen.getByLabelText('Admin cevabını düzenle'),{target:{value:'Kaydedilmeyen yeni Admin deneyimim.'}})
 fireEvent.click(screen.getByRole('button',{name:'Admin cevabı değişikliklerini kaydet'}))
 await screen.findByRole('button',{name:'Güncel Admin bilgilerini yükle'})
 expect(screen.getByLabelText('Admin cevabını düzenle')).toHaveValue('Kaydedilmeyen yeni Admin deneyimim.')
})
it('requires removal confirmation and restores the same versioned answer',async()=>{
 let a={...original}
 const fetch=vi.fn(async(url:string,o:RequestInit)=>{
  if(url.endsWith('/csrf'))return json({token:'csrf'})
  if(url.endsWith('/admin-quota'))return json({...quota,used:1,remaining:4})
  if(url.endsWith('/status')){const body=JSON.parse(o.body as string);a={...a,deletedAt:body.deleted?'2026-09-05T11:00:00Z':null,version:a.version+1};return json(a)}
  if(url.endsWith('/my-admin-answer'))return json({answer:a,assignment:{...initialAssignment,assigned:true,version:1}})
  return list(a.deletedAt?[]:[a])
 });vi.stubGlobal('fetch',fetch);section()
 fireEvent.click(await screen.findByRole('button',{name:'Admin cevabımı kaldır'}));expect(fetch.mock.calls.some(([,o])=>o.method==='PUT')).toBe(false)
 fireEvent.click(screen.getByRole('button',{name:'Admin cevabını kaldırmayı onayla'}))
 fireEvent.click(await screen.findByRole('button',{name:'Admin cevabını geri yükle'}))
 await screen.findByRole('button',{name:'Admin cevabımı düzenle'})
 expect(fetch.mock.calls.filter(([,o])=>o.method==='PUT').map(([,o])=>JSON.parse(o.body as string))).toEqual([{deleted:true,version:0},{deleted:false,version:1}])
})
it('former admins can only remove their existing answer',async()=>{
 setUser({id:'admin',email:'test@example.test',role:'MEZUN',profileCompleted:true})
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/admin-quota')?json({...quota,activeAdmin:false}):url.endsWith('/my-admin-answer')?json({answer:{...original,activeAdmin:false},assignment:initialAssignment}):list([{...original,activeAdmin:false}])))
 section();await screen.findByRole('button',{name:'Admin cevabımı kaldır'})
 expect(screen.queryByRole('button',{name:'Admin cevabımı düzenle'})).not.toBeInTheDocument()
 expect(screen.queryByRole('button',{name:'Cevaplayacağım'})).not.toBeInTheDocument()
 expect(screen.getByText('Artık Admin değil')).toBeVisible()
})
it('archived questions allow removal but no edit or restore',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/admin-quota')?json(quota):url.endsWith('/my-admin-answer')?json({answer:original,assignment:{...initialAssignment,assigned:true,version:1}}):list([original])))
 section(true);await screen.findByRole('button',{name:'Admin cevabımı kaldır'})
 expect(screen.queryByRole('button',{name:'Admin cevabımı düzenle'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Admin cevabını geri yükle'})).not.toBeInTheDocument()
})
it('does not expose removed private text after an account switch',async()=>{
 const fetch=vi.fn(async(url:string)=>url.endsWith('/admin-quota')?json(quota):url.endsWith('/my-admin-answer')?json({answer:{...original,deletedAt:'2026-09-05T11:00:00Z',body:'Kaldırılmış özel metnim.'},assignment:initialAssignment}):list())
 vi.stubGlobal('fetch',fetch);section();await screen.findByText('Kaldırılmış özel metnim.')
 act(()=>setUser(null));await waitFor(()=>expect(screen.queryByText('Kaldırılmış özel metnim.')).not.toBeInTheDocument())
})
it('keeps public list available when private loading fails and offers a retry',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/my-admin-answer')?json({code:'SERVICE_UNAVAILABLE'},503):url.endsWith('/admin-quota')?json(quota):list([original])));section()
 expect(await screen.findByRole('button',{name:'Admin bilgilerini yeniden yükle'})).toBeVisible()
 expect(await screen.findByText(original.body)).toBeVisible();expect(screen.queryByLabelText('Admin cevabın')).not.toBeInTheDocument()
})
it('renders removed authors anonymously without links or educational data',()=>{
 render(<MemoryRouter><AdminAnswerCard answer={{...original,authorId:null,authorName:'Katılımcı',activeAdmin:false,universityName:null,departmentName:null,educationStatus:null}}/></MemoryRouter>)
 expect(screen.getByText('Katılımcı')).toBeVisible();expect(screen.queryByRole('link')).not.toBeInTheDocument()
 expect(screen.queryByText(/ilk yayınındaki doğrulama/)).not.toBeInTheDocument()
})


it('blocks editing and restoration of a Manager-hidden Admin answer',async()=>{vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/admin-quota')?json(quota):url.endsWith('/my-admin-answer')?json({answer:{...original,moderatedAt:original.publishedAt,deletedAt:original.publishedAt},assignment:{...initialAssignment,assigned:true,version:1}}):list()));section();await screen.findByText(/Admin cevabın Manager tarafından gizlendi/);expect(screen.queryByRole('button',{name:'Admin cevabını geri yükle'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Admin cevabımı düzenle'})).not.toBeInTheDocument()})
