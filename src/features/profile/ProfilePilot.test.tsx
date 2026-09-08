import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import { MemoryRouter,Routes,Route } from 'react-router-dom'
import { afterEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { ProfilePage } from './ProfilePage'
vi.mock('../../config/pilot',()=>({pilotMode:true}))
afterEach(()=>vi.unstubAllGlobals())
it('completes a pilot profile without an avatar or an upload prompt',async()=>{
 const profile={firstName:null,lastName:null,educationStatus:null,education:null,graduationYear:null,biography:null,occupation:null,company:null,completed:false,version:0}
 setUser({id:'pilot',email:'pilot@example.test',role:'USER',profileCompleted:false})
 const fetch=vi.fn(async(url:string,options:RequestInit)=>new Response(JSON.stringify(url.endsWith('/csrf')?{token:'csrf'}:url.endsWith('/avatar')?{fileId:null}:options.method==='PUT'?{...profile,firstName:'Ada',lastName:'Yılmaz',educationStatus:'YKS_ADAYI',completed:true,version:1}:profile)))
 vi.stubGlobal('fetch',fetch)
 render(<MemoryRouter initialEntries={['/profile']}><Routes><Route path="/profile" element={<ProfilePage/>}/><Route path="/account" element={<h1>Kaydedilmiş hesap</h1>}/></Routes></MemoryRouter>)
 fireEvent.change(await screen.findByLabelText('Ad'),{target:{value:'Ada'}});fireEvent.change(screen.getByLabelText('Soyad'),{target:{value:'Yılmaz'}})
 expect(screen.queryByRole('button',{name:'Profil fotoğrafını düzenle'})).not.toBeInTheDocument()
 fireEvent.click(screen.getByRole('button',{name:'Profili kaydet'}))
 await screen.findByRole('heading',{name:'Kaydedilmiş hesap'})
 await waitFor(()=>expect(fetch.mock.calls.filter(([,o])=>o.method==='PUT')).toHaveLength(1))
})
