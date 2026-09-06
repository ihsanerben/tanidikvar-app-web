import { render,screen,fireEvent } from '@testing-library/react'
import { MemoryRouter,Routes,Route } from 'react-router-dom'
import { afterEach,beforeEach,expect,it,vi } from 'vitest'
import { AccountPage } from './AccountPage'
import { setUser } from './authStore'
const profile={firstName:'Deniz',lastName:'Yılmaz',educationStatus:'UNIVERSITE_OGRENCISI',education:{id:'ud',universityId:'u',universityName:'Dokuz Eylül Üniversitesi',departmentId:'d',departmentName:'Bilgisayar Mühendisliği',available:true,deletedAt:null,version:0},graduationYear:null,biography:null,occupation:null,company:null,completed:true,version:1}
beforeEach(()=>{setUser({id:'user',email:'test@example.test',role:'UNIVERSITE_OGRENCISI',profileCompleted:true});vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(profile))))})
afterEach(()=>vi.unstubAllGlobals())
it('shows a concise account summary and links to a separate status page',async()=>{
 render(<MemoryRouter initialEntries={['/account']}><Routes><Route path="/account" element={<AccountPage/>}/><Route path="/account/status" element={<AccountPage status/>}/></Routes></MemoryRouter>)
 expect(await screen.findByText('Deniz Yılmaz')).toBeVisible();expect(screen.getByText('Dokuz Eylül Üniversitesi')).toBeVisible();expect(screen.getByText('Bilgisayar Mühendisliği')).toBeVisible()
 expect(screen.getByRole('link',{name:'Soru sor'})).toHaveClass('button')
 fireEvent.click(screen.getByRole('link',{name:'Hesap durumu'}));expect(await screen.findByRole('heading',{name:'Hesap durumu'})).toBeVisible();expect(screen.getAllByText('Tamamlandı')).toHaveLength(2)
})
it('marks an incomplete profile as missing',()=>{
 setUser({id:'user',email:'test@example.test',role:'USER',profileCompleted:false})
 render(<MemoryRouter><AccountPage status/></MemoryRouter>);expect(screen.getByText('Eksik')).toBeVisible();expect(screen.getByRole('link',{name:'Profilini tamamla'})).toHaveAttribute('href','/profile')
})

it('admin account offers answers and comments without questions or applications',async()=>{
 setUser({id:'user',email:'test@example.test',role:'ADMIN',profileCompleted:true})
 render(<MemoryRouter><AccountPage/></MemoryRouter>);await screen.findByText('Deniz Yılmaz')
 expect(screen.getByRole('link',{name:'Cevaplarım'})).toHaveAttribute('href','/admin')
 expect(screen.getByRole('link',{name:'Yorumlarım'})).toBeVisible()
 for(const name of ['Sorularım','Soru sor','Admin başvurularım'])expect(screen.queryByRole('link',{name})).not.toBeInTheDocument()
})
