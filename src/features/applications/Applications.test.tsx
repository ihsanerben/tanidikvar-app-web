import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { ApplicationsPage } from './ApplicationsPage'
import { AvatarEditor } from '../profile/AvatarEditor'
const app={id:'application',applicantId:'member',firstName:'Ada',lastName:'Yılmaz',educationStatus:'MEZUN',universityName:'Test Üniversitesi',departmentName:'Bilgisayar',graduationYear:2025,occupation:null,company:null,documentFileId:'document',status:'PENDING',submittedAt:'2026-09-05T10:00:00Z',reviewedBy:null,reviewedAt:null,rejectionReason:null,version:0,activeVerification:false}
const profile={firstName:'Ada',lastName:'Yılmaz',educationStatus:'MEZUN',education:{id:'education',universityId:'university',universityName:'Test Üniversitesi',departmentId:'department',departmentName:'Bilgisayar',deletedAt:null,available:true,version:0},graduationYear:2025,biography:null,occupation:null,company:null,completed:true,version:1}
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status})
const list=(items:unknown[]=[])=>json({items,page:0,size:10,totalElements:items.length})
beforeEach(()=>setUser({id:'member',email:'test@example.test',role:'MEZUN',profileCompleted:true}))
afterEach(()=>vi.unstubAllGlobals())
function page(manager=false){return render(<MemoryRouter><ApplicationsPage manager={manager}/></MemoryRouter>)}
it('shows immutable pending details without a second submission form',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>list([{...app,firstName:'<script>alert(1)</script>'}])));page()
 expect(await screen.findByText('<script>alert(1)</script> Yılmaz')).toBeVisible()
 expect(document.querySelector('script')).toBeNull();expect(screen.queryByLabelText('e-Devlet öğrenci / mezun belgesi')).not.toBeInTheDocument()
 expect(screen.queryByRole('button',{name:'Kabul et'})).not.toBeInTheDocument()
})
it('submits multipart with CSRF and leaves the browser to set the boundary',async()=>{
 let saved=false
 const fetch=vi.fn(async(url:string,options:RequestInit)=>{
  if(url.endsWith('/csrf'))return json({token:'csrf'})
  if(url.endsWith('/profile'))return json(profile)
  if(options.method==='POST'){saved=true;return json(app,201)}
  return list(saved?[app]:[])
 });vi.stubGlobal('fetch',fetch);page()
 fireEvent.change(await screen.findByLabelText('e-Devlet öğrenci / mezun belgesi'),{target:{files:[new File(['%PDF-1.4\n%%EOF'],'belge.pdf',{type:'application/pdf'})]}})
 fireEvent.submit(screen.getByRole('button',{name:'Başvuruyu gönder'}).closest('form')!)
 await screen.findByText('Başvurun alındı. Manager incelemesini burada takip edebilirsin.')
 const call=fetch.mock.calls.find(([,o])=>o.method==='POST')!
 expect(call[1].body).toBeInstanceOf(FormData)
 expect(call[1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
 expect(call[1].headers).not.toHaveProperty('Content-Type')
})
it('preserves the submission key on network retry',async()=>{
 const fetch=vi.fn(async(url:string,options:RequestInit)=>{
  if(url.endsWith('/csrf'))return json({token:'csrf'})
  if(url.endsWith('/profile'))return json(profile)
  if(options.method==='POST')throw new TypeError('offline')
  return list()
 });vi.stubGlobal('fetch',fetch);page()
 fireEvent.change(await screen.findByLabelText('e-Devlet öğrenci / mezun belgesi'),{target:{files:[new File(['pdf'],'belge.pdf')]}})
 fireEvent.submit(screen.getByRole('button',{name:'Başvuruyu gönder'}).closest('form')!);await screen.findByText('Bağlantı kurulamadı. Lütfen tekrar dene.')
 fireEvent.submit(screen.getByRole('button',{name:'Başvuruyu gönder'}).closest('form')!)
 await waitFor(()=>expect(fetch.mock.calls.filter(([,o])=>o.method==='POST')).toHaveLength(2))
 const calls=fetch.mock.calls.filter(([,o])=>o.method==='POST')
 const read=(v:FormDataEntryValue|null)=>new Promise<string>(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.readAsText(v as Blob)})
 expect(await read((calls[0][1].body as FormData).get('request'))).toEqual(await read((calls[1][1].body as FormData).get('request')))
})
it('requires manager confirmation and keeps rejection reason after a stale decision',async()=>{
 setUser({id:'manager',email:'test@example.test',role:'MANAGER',profileCompleted:false})
 const fetch=vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='PUT'?json({code:'STALE_VERSION'},409):list([app]))
 vi.stubGlobal('fetch',fetch);page(true)
 fireEvent.click(await screen.findByRole('button',{name:'Reddet'}))
 expect(fetch.mock.calls.some(([,o])=>o.method==='PUT')).toBe(false)
 fireEvent.change(screen.getByLabelText('Gerekçe'),{target:{value:'Belge okunmuyor.'}})
 fireEvent.click(screen.getByRole('button',{name:'Kararı onayla'}))
 await screen.findByRole('button',{name:'Güncel listeyi yükle'})
 expect(screen.getByLabelText('Gerekçe')).toHaveValue('Belge okunmuyor.')
 expect(JSON.parse(fetch.mock.calls.find(([,o])=>o.method==='PUT')![1].body as string)).toEqual({status:'REJECTED',reason:'Belge okunmuyor.',version:0})
})
it('explains pending closure before revocation and sends the active verification id',async()=>{
 setUser({id:'manager',email:'test@example.test',role:'MANAGER',profileCompleted:false})
 const fetch=vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='POST'?new Response(null,{status:204}):list([{...app,status:'APPROVED',activeVerification:true}]))
 vi.stubGlobal('fetch',fetch);page(true)
 fireEvent.click(await screen.findByRole('button',{name:'Admin yetkisini kaldır'}))
 expect(screen.getByText('Admin yetkisi kaldırılacak ve bekleyen başvuru gerekçesiyle reddedilecek.')).toBeVisible()
 fireEvent.change(screen.getByLabelText('Gerekçe'),{target:{value:'Doğrulama geçersiz.'}})
 fireEvent.click(screen.getByRole('button',{name:'Kararı onayla'}))
 await waitFor(()=>expect(fetch.mock.calls.some(([,o])=>o.method==='POST')).toBe(true))
 expect(JSON.parse(fetch.mock.calls.find(([,o])=>o.method==='POST')![1].body as string).verificationId).toBe('application')
})
it('gates candidate applications and retries failed listing',async()=>{
 let failed=true
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.endsWith('/profile')?json({...profile,educationStatus:'YKS_ADAYI',education:null,graduationYear:null}):failed?json({code:'SERVICE_UNAVAILABLE'},503):list()))
 page();await screen.findByRole('button',{name:'Tekrar dene'});failed=false
 fireEvent.click(screen.getByRole('button',{name:'Tekrar dene'}))
 expect(await screen.findByRole('link',{name:'Profilime git'})).toHaveAttribute('href','/profile')
})
it('shows and removes public avatar through a protected mutation',async()=>{
 const fetch=vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='POST'?new Response(null,{status:204}):json({fileId:'avatar'}))
 vi.stubGlobal('fetch',fetch);render(<AvatarEditor/>)
 expect(await screen.findByAltText('Profil fotoğrafın')).toHaveAttribute('src',expect.stringContaining('/api/avatars/avatar'))
 fireEvent.click(screen.getByRole('button',{name:'Fotoğrafı kaldır'}));await screen.findByText('Fotoğraf güncellendi.')
 expect(screen.queryByAltText('Profil fotoğrafın')).not.toBeInTheDocument()
 expect(fetch.mock.calls.find(([,o])=>o.method==='POST')?.[1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
})

