import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach,expect,it,vi } from 'vitest'
import { CatalogPage } from './CatalogPage'
import { setUser } from '../auth/authStore'
const json=(data:unknown)=>new Response(JSON.stringify(data))
afterEach(()=>vi.unstubAllGlobals())
it('does not expose manager controls to regular users',()=>{
  setUser({id:'id',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true})
  render(<MemoryRouter><CatalogPage/></MemoryRouter>)
  expect(screen.getByRole('heading',{name:'Bu sayfaya erişim iznin yok.'})).toBeVisible()
  expect(screen.queryByRole('button',{name:'Ekle'})).not.toBeInTheDocument()
})
it('allows a manager to create a university and renders the returned catalog',async()=>{
  setUser({id:'id',email:'test@example.test',role:'MANAGER',profileCompleted:false})
  let created=false
  const entry={id:'university',name:'Test Üniversitesi',deletedAt:null,version:0}
  const fetch=vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(options.method==='POST'){created=true;return json(entry)}
    return json({items:created?[entry]:[],page:0,size:20,totalElements:created?1:0})
  })
  vi.stubGlobal('fetch',fetch)
  render(<MemoryRouter initialEntries={['/manager/catalog?tab=UNIVERSITY']}><CatalogPage/></MemoryRouter>)
  await screen.findByText('Henüz kayıt yok. Yeni bir kayıt ekleyebilirsin.')
  fireEvent.change(screen.getByLabelText('Yeni kayıt adı'),{target:{value:'Test Üniversitesi'}})
  fireEvent.change(screen.getByLabelText('Ekleme gerekçesi'),{target:{value:'Başlangıç kataloğu'}})
  fireEvent.click(screen.getByRole('button',{name:'Ekle'}))
  await screen.findByText('Test Üniversitesi')
  expect(fetch.mock.calls.some(([url,options])=>url.endsWith('/api/manager/catalog/UNIVERSITY') && options.method==='POST')).toBe(true)
})
it('allows a manager to add multiple tags one per line',async()=>{
  setUser({id:'id',email:'test@example.test',role:'MANAGER',profileCompleted:false})
  const fetch=vi.fn(async(url:string,options:RequestInit={})=>{
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(url.endsWith('/api/manager/catalog/tags/bulk-import')&&options.method==='POST')return json({tagsCreated:2,skipped:1})
    return json({items:[],page:0,size:100,totalElements:0})
  })
  vi.stubGlobal('fetch',fetch)
  render(<MemoryRouter initialEntries={['/manager/tags']}><CatalogPage tags/></MemoryRouter>)
  fireEvent.click(screen.getByText('Toplu tag ekle'))
  fireEvent.change(screen.getByLabelText('Tagler'),{target:{value:'Erasmus\nKampüs hayatı\nErasmus'}})
  fireEvent.change(screen.getByLabelText('İşlem gerekçesi'),{target:{value:'Yeni konu listesi'}})
  fireEvent.click(screen.getByRole('button',{name:'Kontrol et ve toplu ekle'}))
  await screen.findByText('2 tag eklendi. 1 mevcut veya yinelenen tag atlandı.')
  await waitFor(()=>expect(fetch.mock.calls.some(([url,options])=>url.endsWith('/api/manager/catalog/tags/bulk-import')&&options?.method==='POST'&&JSON.parse(String(options?.body)).tags.length===3)).toBe(true))
})
