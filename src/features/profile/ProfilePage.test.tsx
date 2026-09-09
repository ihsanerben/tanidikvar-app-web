import { render } from '../../test/render'
import { screen,fireEvent,act,within,waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { setUser,reload } from '../auth/authStore'
const empty={firstName:null,lastName:null,educationStatus:null,education:null,graduationYear:null,biography:null,occupation:null,company:null,completed:false,version:0}
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status})
beforeEach(()=>setUser({id:'user',email:'test@example.test',role:'USER',profileCompleted:false}))
afterEach(()=>vi.unstubAllGlobals())
it('loads every university page and resets the department when university changes',async()=>{
  const universities=Array.from({length:130},(_,i)=>({id:`u${i}`,name:`Üniversite ${i}`,version:0,deletedAt:null}))
  const fetch=vi.fn(async(url:string)=>{
    if(url.includes('/departments')){
      const universityId=url.includes('/u0/')?'u0':'u1'
      return json({items:[{id:`${universityId}-d`,universityId,universityName:'Üniversite',departmentId:'d',departmentName:'Bilgisayar Mühendisliği',available:true,version:0,deletedAt:null}],page:0,size:100,totalElements:1})
    }
    if(url.includes('/universities')){const page=Number(new URL(url,'https://example.test').searchParams.get('page'));return json({items:universities.slice(page*100,(page+1)*100),page,size:100,totalElements:universities.length})}
    return json(empty)
  })
  vi.stubGlobal('fetch',fetch)
  render(<MemoryRouter><ProfilePage/></MemoryRouter>)
  fireEvent.change(await screen.findByLabelText('Eğitim durumu'),{target:{value:'UNIVERSITE_OGRENCISI'}})
  await waitFor(()=>expect(screen.getByLabelText('Üniversite')).toBeEnabled())
  expect(within(screen.getByLabelText('Üniversite')).getAllByRole('option')).toHaveLength(131)
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
  expect(fetch.mock.calls.some(([url])=>url.includes('/universities?page=1&size=100'))).toBe(true)
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
  function Location(){return <output data-testid="location">{useLocation().pathname}</output>}
  render(<MemoryRouter initialEntries={['/profile']}><Routes><Route path="/profile" element={<ProfilePage/>}/><Route path="/account" element={<Location/>}/></Routes></MemoryRouter>)
  await screen.findByLabelText('Ad')
  expect(screen.queryByLabelText('Üniversite')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Ad'),{target:{value:'Ada'}});fireEvent.change(screen.getByLabelText('Soyad'),{target:{value:'Yılmaz'}})
  fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
  expect(await screen.findByTestId('location')).toHaveTextContent('/account')
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

it('offers social links without a profile photo control',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>json(empty)))
 render(<MemoryRouter><ProfilePage/></MemoryRouter>)
 await screen.findByLabelText('Ad')
 expect(screen.queryByRole('button',{name:'Profil fotoğrafını düzenle'})).not.toBeInTheDocument()
 expect(screen.queryByLabelText('Fotoğraf seç')).not.toBeInTheDocument()
 expect(screen.getByLabelText('LinkedIn bağlantısı')).toHaveAttribute('type','url')
 expect(screen.getByLabelText('Portfolyo sitesi')).not.toBeRequired()
})
it('saves a profile without a profile photo',async()=>{
 const fetch=vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='PUT'?json({...empty,firstName:'Ada',lastName:'Yılmaz',educationStatus:'YKS_ADAYI',completed:true,version:1}):json(empty))
 vi.stubGlobal('fetch',fetch)
 render(<MemoryRouter><ProfilePage/></MemoryRouter>)
 await screen.findByLabelText('Ad')
 fireEvent.change(screen.getByLabelText('Ad'),{target:{value:'Ada'}})
 fireEvent.change(screen.getByLabelText('Soyad'),{target:{value:'Yılmaz'}})
 fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
 await waitFor(()=>expect(fetch.mock.calls.some(([,options])=>options.method==='PUT')).toBe(true))
 expect(fetch.mock.calls.some(([url])=>String(url).endsWith('/avatar'))).toBe(false)
})
