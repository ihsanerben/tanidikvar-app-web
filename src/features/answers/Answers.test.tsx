import { render,screen,fireEvent,waitFor,within,act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { AnswerSection } from './AnswerSection'
const original={id:'answer',questionId:'question',authorId:'member',authorName:'Ada Yılmaz',answerKind:'COMMUNITY',body:'Kampüs hakkında gerçek bir deneyim.',publishedAt:'2026-09-05T10:00:00Z',editedAt:null,deletedAt:null,version:0}
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status})
const list=(items:unknown[]=[])=>json({items,page:0,size:20,totalElements:items.length})
beforeEach(()=>setUser({id:'member',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true}))
afterEach(()=>vi.unstubAllGlobals())
function section(archived=false){return render(<MemoryRouter><AnswerSection questionId="question" archived={archived} reloadQuestion={()=>undefined}/></MemoryRouter>)}
it('lets anonymous users read safe text and asks them to log in before writing',async()=>{
  setUser(null);vi.stubGlobal('fetch',vi.fn(async()=>list([{...original,body:'<script>alert(1)</script>'}])))
  section();expect(await screen.findByText('<script>alert(1)</script>')).toBeVisible()
  expect(document.querySelector('script')).toBeNull();expect(screen.getByRole('link',{name:'Giriş yap'})).toHaveAttribute('href','/login')
  expect(screen.queryByRole('button',{name:'Cevabımı düzenle'})).not.toBeInTheDocument()
})
it('requires a completed profile and never offers a second answer form',async()=>{
  setUser({id:'member',email:'test@example.test',role:'USER',profileCompleted:false})
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/my-answer')?json(original):list([original])))
  section();await screen.findByRole('link',{name:'Profilini tamamla'});expect(screen.queryByLabelText('Cevabın')).not.toBeInTheDocument()
})
it('publishes with CSRF and replaces the form with own-answer actions',async()=>{
  let saved=false
  const fetch=vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(options.method==='POST'){saved=true;return json(original,201)}
    if(url.endsWith('/my-answer'))return new Response(null,{status:204})
    return list(saved?[original]:[])
  });vi.stubGlobal('fetch',fetch);section()
  fireEvent.change(await screen.findByLabelText('Cevabın'),{target:{value:original.body}});fireEvent.click(screen.getByRole('button',{name:'Cevabı yayınla'}))
  await screen.findByRole('button',{name:'Cevabımı düzenle'});await screen.findByText('1 topluluk cevabı')
  expect(screen.queryByLabelText('Cevabın')).not.toBeInTheDocument()
  expect(fetch.mock.calls.find(([,options])=>options.method==='POST')?.[1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
})
it('keeps edited text when the server rejects a stale version',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='PUT'?json({code:'STALE_VERSION'},409):url.endsWith('/my-answer')?json(original):list([original])))
  section();fireEvent.click(await screen.findByRole('button',{name:'Cevabımı düzenle'}))
  fireEvent.change(screen.getByLabelText('Cevabını düzenle'),{target:{value:'Kaydedilmeyen yeni cevap içeriği'}})
  fireEvent.click(screen.getByRole('button',{name:'Cevap değişikliklerini kaydet'}));await screen.findByRole('button',{name:'Güncel cevabımı yükle'})
  expect(screen.getByLabelText('Cevabını düzenle')).toHaveValue('Kaydedilmeyen yeni cevap içeriği')
})
it('removes only after confirmation and restores the same answer without another POST',async()=>{
  let current:Omit<typeof original,'deletedAt'> & {deletedAt:string|null}={...original}
  const fetch=vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(options.method==='PUT'){const body=JSON.parse(options.body as string);current={...current,deletedAt:body.deleted?'2026-09-05T11:00:00Z':null,version:current.version+1};return json(current)}
    return url.endsWith('/my-answer')?json(current):list(current.deletedAt?[]:[current])
  });vi.stubGlobal('fetch',fetch);section()
  fireEvent.click(await screen.findByRole('button',{name:'Cevabımı kaldır'}))
  expect(fetch.mock.calls.some(([,options])=>options.method==='PUT')).toBe(false)
  fireEvent.click(screen.getByRole('button',{name:'Kaldırmayı onayla'}));await screen.findByText('0 topluluk cevabı')
  fireEvent.click(await screen.findByRole('button',{name:'Cevabı geri yükle'}));await screen.findByText('1 topluluk cevabı')
  expect(fetch.mock.calls.filter(([,options])=>options.method==='PUT')).toHaveLength(2)
  expect(fetch.mock.calls.some(([,options])=>options.method==='POST')).toBe(false)
})
it('archived questions allow removal but expose no edit or restore action',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/my-answer')?json(original):list([original])))
  section(true);await screen.findByRole('button',{name:'Cevabımı kaldır'})
  expect(screen.queryByRole('button',{name:'Cevabımı düzenle'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Cevabı geri yükle'})).not.toBeInTheDocument()
})
it('maps validation errors and preserves the draft after a failed save',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='POST'?json({code:'VALIDATION_FAILED',fieldErrors:{body:'invalid'}},400):url.endsWith('/my-answer')?new Response(null,{status:204}):list()))
  section();fireEvent.change(await screen.findByLabelText('Cevabın'),{target:{value:'Kontrol edilecek cevap metni'}});fireEvent.click(screen.getByRole('button',{name:'Cevabı yayınla'}))
  await waitFor(()=>expect(screen.getByLabelText('Cevabın')).toHaveAttribute('aria-invalid','true'))
  expect(screen.getByLabelText('Cevabın')).toHaveAccessibleDescription(/Cevap 10–5000 karakter olmalı/)
})
it('does not treat an unavailable private response as permission to create',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/my-answer')?json({code:'SERVICE_UNAVAILABLE'},503):list()))
  section();await screen.findByRole('button',{name:'Cevabımı tekrar yükle'});expect(screen.queryByLabelText('Cevabın')).not.toBeInTheDocument()
})
it('clears removed private answer content when the account changes',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/my-answer')?json({...original,deletedAt:original.publishedAt}):list()))
  section();await screen.findByText(original.body)
  act(()=>setUser(null));expect(screen.queryByText(original.body)).not.toBeInTheDocument()
})
it('loads later public pages from the server',async()=>{
  setUser(null);vi.stubGlobal('fetch',vi.fn(async(url:string)=>json({items:[{...original,body:url.includes('page=1')?'İkinci sayfadaki cevap metni':original.body}],page:url.includes('page=1')?1:0,size:20,totalElements:21})))
  section();fireEvent.click(await screen.findByRole('button',{name:'Sonraki cevaplar'}))
  expect(await screen.findByText('İkinci sayfadaki cevap metni')).toBeVisible()
  expect(within(screen.getByRole('region',{name:'Topluluk cevapları'})).queryByText(original.body)).not.toBeInTheDocument()
})
