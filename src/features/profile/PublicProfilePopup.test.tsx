import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { ProfileTrigger,ProfileLinks } from './PublicProfilePopup'
const profile={id:'user',name:'Ada Yılmaz',role:'MEZUN',educationStatus:'MEZUN',universityName:'Test Üniversitesi',departmentName:'Bilgisayar',graduationYear:2020,biography:'Merhaba',occupation:'Mühendis',company:null,linkedinUrl:'https://www.linkedin.com/in/ada',portfolioUrl:'https://ada.example.test',avatarFileId:null}
beforeEach(()=>{})
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals()})
it('loads the selected public profile on demand with safe external links and closes',async()=>{
 const fetch=vi.fn(async()=>new Response(JSON.stringify(profile)));vi.stubGlobal('fetch',fetch)
 render(<ProfileTrigger id="user" name="Ada Yılmaz"/>);expect(fetch).not.toHaveBeenCalled()
 fireEvent.click(screen.getByRole('button',{name:'Ada Yılmaz profilini görüntüle'}))
 expect(await screen.findByText('Test Üniversitesi')).toBeVisible()
 expect(screen.getByRole('link',{name:'LinkedIn ↗'})).toHaveAttribute('rel','noopener noreferrer')
 expect(screen.getByRole('link',{name:'Portfolyo ↗'})).toHaveAttribute('href','https://ada.example.test/')
 fireEvent.click(screen.getByRole('button',{name:'Profili kapat'}));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})
it('does not offer a removed author profile or unsafe external URL',()=>{
 render(<><ProfileTrigger id={null} name="Katılımcı"/><ProfileLinks linkedinUrl="javascript:alert(1)" portfolioUrl="https://user:pass@example.test"/></>)
 expect(screen.queryByRole('button')).not.toBeInTheDocument();expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
it('shows an unavailable profile error without stale personal information',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({code:'NOT_FOUND',message:'Profil bulunamadı.'}),{status:404})))
 render(<ProfileTrigger id="removed" name="Ada"/>);fireEvent.click(screen.getByRole('button',{name:'Ada profilini görüntüle'}))
 expect(await screen.findByRole('alert')).toBeVisible();expect(screen.queryByRole('link')).not.toBeInTheDocument()
})
