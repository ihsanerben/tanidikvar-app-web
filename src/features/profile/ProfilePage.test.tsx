import { render,screen,fireEvent,act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { ProfilePage } from './ProfilePage'
import { setUser,reload } from '../auth/authStore'
const empty={firstName:null,lastName:null,educationStatus:null,education:null,graduationYear:null,biography:null,occupation:null,company:null,completed:false,version:0}
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status})
beforeEach(()=>setUser({id:'user',email:'test@example.test',role:'USER',profileCompleted:false}))
afterEach(()=>vi.unstubAllGlobals())
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
  await screen.findByText('Profilin kaydedildi.')
  const call=fetch.mock.calls.find(([,options])=>options.method==='PUT')!
  expect(JSON.parse(call[1].body as string)).toMatchObject({educationStatus:'YKS_ADAYI',universityDepartmentId:null,graduationYear:null,version:0})
  expect(call[1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
})
it('requires education for students and shows server errors near the field',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>{
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
