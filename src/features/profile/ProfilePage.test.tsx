import { render } from '../../test/render'
import { screen,fireEvent,act,within,waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { setUser,reload } from '../auth/authStore'
const empty={firstName:null,lastName:null,educationStatus:null,education:null,graduationYear:null,biography:null,occupation:null,company:null,completed:false,version:0}
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status})
beforeEach(()=>setUser({id:'user',email:'test@example.test',role:'USER',profileCompleted:false}))
afterEach(()=>vi.unstubAllGlobals())
it('offers ten university choices without search or paging and resets the department when university changes',async()=>{
  const universities=Array.from({length:10},(_,i)=>({id:`u${i}`,name:`Üniversite ${i}`,version:0,deletedAt:null}))
  const fetch=vi.fn(async(url:string)=>{
    if(url.includes('/departments')){
      const universityId=url.includes('/u0/')?'u0':'u1'
      return json({items:[{id:`${universityId}-d`,universityId,universityName:'Üniversite',departmentId:'d',departmentName:'Bilgisayar Mühendisliği',available:true,version:0,deletedAt:null}],page:0,size:10,totalElements:1})
    }
    if(url.includes('/universities'))return json({items:universities,page:0,size:10,totalElements:30})
    return json(empty)
  })
  vi.stubGlobal('fetch',fetch)
  render(<MemoryRouter><ProfilePage/></MemoryRouter>)
  fireEvent.change(await screen.findByLabelText('Eğitim durumu'),{target:{value:'UNIVERSITE_OGRENCISI'}})
  await waitFor(()=>expect(screen.getByLabelText('Üniversite')).toBeEnabled())
  expect(within(screen.getByLabelText('Üniversite')).getAllByRole('option')).toHaveLength(11)
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:'Önceki'})).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:'Sonraki'})).not.toBeInTheDocument()
  expect(screen.getByLabelText('Bölüm')).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Üniversite'),{target:{value:'u0'}})
  await waitFor(()=>expect(screen.getByLabelText('Bölüm')).toBeEnabled())
  fireEvent.change(screen.getByLabelText('Bölüm'),{target:{value:'u0-d'}})
  expect(screen.getByLabelText('Bölüm')).toHaveValue('u0-d')
  fireEvent.change(screen.getByLabelText('Üniversite'),{target:{value:'u1'}})
  await waitFor(()=>expect(screen.getByLabelText('Bölüm')).toBeEnabled())
  expect(screen.getByLabelText('Bölüm')).toHaveValue('')
  expect(within(screen.getByLabelText('Bölüm')).queryByRole('option',{name:'Bilgisayar Mühendisliği'})).toHaveValue('u1-d')
  expect(fetch.mock.calls.filter(([url])=>url.includes('/universities')).every(([url])=>url.includes('page=0&size=10'))).toBe(true)
})
it('keeps unsaved profile fields during a background session check',async()=>{
  let completeSession!: (response:Response)=>void
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
    if(url.endsWith('/api/me'))return new Promise<Response>(resolve=>{completeSession=resolve})
    return json(empty)
  }))
  render(<MemoryRouter><ProfilePage/></MemoryRouter>)
  fireEvent.change(await screen.findByLabelText('Ad'),{target:{value:'Kaydedilmemiş'}})
  let check!:Promise<void>
  act(()=>{check=reload()})
  expect(screen.getByLabelText('Ad')).toHaveValue('Kaydedilmemiş')
  await act(async()=>{
    completeSession(json({id:'user',email:'test@example.test',role:'USER',profileCompleted:false}))
    await check
  })
  expect(screen.getByLabelText('Ad')).toHaveValue('Kaydedilmemiş')
})
it('completes a candidate profile without asking for university details',async()=>{
  const fetch=vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/avatar'))return json({fileId:'avatar'})
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(options.method==='PUT')return json({...empty,firstName:'Ada',lastName:'Yılmaz',educationStatus:'YKS_ADAYI',completed:true,version:1})
    return json(empty)
  })
  vi.stubGlobal('fetch',fetch)
  render(<MemoryRouter><ProfilePage/></MemoryRouter>)
  await screen.findByLabelText('Ad')
  expect(screen.queryByLabelText('Üniversite')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Ad'),{target:{value:'Ada'}});fireEvent.change(screen.getByLabelText('Soyad'),{target:{value:'Yılmaz'}})
  fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
  await screen.findByText('Bilgiler kaydedildi.')
  const call=fetch.mock.calls.find(([,options])=>options.method==='PUT')!
  expect(JSON.parse(call[1].body as string)).toMatchObject({educationStatus:'YKS_ADAYI',universityDepartmentId:null,graduationYear:null,version:0})
  expect(call[1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
})
it('requires education for students and shows server errors near the field',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/avatar'))return json({fileId:'avatar'})
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(options.method==='PUT')return json({code:'VALIDATION_FAILED',fieldErrors:{universityDepartmentId:'required'}},400)
    if(url.includes('/universities'))return json({items:[],page:0,size:20,totalElements:0})
    return json(empty)
  }))
  render(<MemoryRouter><ProfilePage/></MemoryRouter>)
  await screen.findByLabelText('Ad')
  fireEvent.change(screen.getByLabelText('Ad'),{target:{value:'Ada'}});fireEvent.change(screen.getByLabelText('Soyad'),{target:{value:'Yılmaz'}})
  fireEvent.change(screen.getByLabelText('Eğitim durumu'),{target:{value:'UNIVERSITE_OGRENCISI'}})
  expect(screen.getByLabelText('Bölüm')).toBeDisabled()
  fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
  await screen.findByRole('alert')
  expect(screen.getByLabelText('Bölüm')).toHaveAttribute('aria-invalid','true')
  expect(screen.queryByLabelText('Mezuniyet yılı')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Eğitim durumu'),{target:{value:'MEZUN'}})
  expect(screen.getByLabelText('Mezuniyet yılı')).toBeRequired()
})
it('offers reloading instead of silently overwriting a stale profile',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/avatar'))return json({fileId:'avatar'})
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(options.method==='PUT')return json({code:'STALE_VERSION'},409)
    return json({...empty,firstName:'Ada',lastName:'Yılmaz',educationStatus:'YKS_ADAYI',completed:true,version:1})
  }))
  render(<MemoryRouter><ProfilePage/></MemoryRouter>)
  await screen.findByLabelText('Ad')
  fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
  expect(await screen.findByRole('button',{name:'Güncel profili yükle'})).toBeVisible()
  expect(screen.getByLabelText('Ad')).toHaveValue('Ada')
})

it('offers photo and social links before first profile save',async()=>{
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>json(url.endsWith('/avatar')?{fileId:null}:empty)))
 render(<MemoryRouter><ProfilePage/></MemoryRouter>)
 fireEvent.click(await screen.findByRole('button',{name:'Profil fotoğrafını düzenle'}));expect(await screen.findByLabelText('Fotoğraf seç')).toBeInTheDocument()
 expect(screen.getByLabelText('LinkedIn bağlantısı')).toHaveAttribute('type','url')
 expect(screen.getByLabelText('Portfolyo sitesi')).not.toBeRequired()
})
it('stops profile completion and explains the missing required photo',async()=>{
 const fetch=vi.fn(async(url:string)=>json(url.endsWith('/avatar')?{fileId:null}:empty))
 vi.stubGlobal('fetch',fetch)
 render(<MemoryRouter><ProfilePage/></MemoryRouter>)
 await screen.findByLabelText('Ad')
 await waitFor(()=>expect(fetch.mock.calls.some(([url])=>String(url).endsWith('/avatar'))).toBe(true))
 act(()=>window.dispatchEvent(new CustomEvent('avatar:updated',{detail:null})))
 fireEvent.change(screen.getByLabelText('Ad'),{target:{value:'Ada'}})
 fireEvent.change(screen.getByLabelText('Soyad'),{target:{value:'Yılmaz'}})
 fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
 expect((await screen.findAllByText('Profilini tamamlamak için profil fotoğrafı ekle.')).length).toBeGreaterThan(0)
 expect(fetch.mock.calls.some(call=>(call as unknown as [string,RequestInit?])[1]?.method==='PUT')).toBe(false)
})
