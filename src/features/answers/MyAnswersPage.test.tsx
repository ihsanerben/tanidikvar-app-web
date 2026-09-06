import { render,screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach,expect,it,vi } from 'vitest'
import { MyAnswersPage } from './MyAnswersPage'
import { setUser } from '../auth/authStore'
afterEach(()=>vi.unstubAllGlobals())
it('requires login before loading private comments',()=>{
 setUser(null);const fetch=vi.fn();vi.stubGlobal('fetch',fetch);render(<MemoryRouter><MyAnswersPage/></MemoryRouter>)
 expect(screen.getByRole('heading',{name:'Önce giriş yap.'})).toBeVisible();expect(fetch).not.toHaveBeenCalled()
})
it('shows the question and removed comment with a working detail link',async()=>{
 setUser({id:'u',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true})
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({items:[{questionTitle:'Kampüs hayatı nasıl?',answer:{id:'a',questionId:'q',authorId:'u',authorName:'Deniz',answerKind:'COMMUNITY',body:'Kendi deneyimim burada.',publishedAt:'2026-09-01T12:00:00Z',editedAt:null,deletedAt:'2026-09-02T12:00:00Z',moderatedAt:null,version:1}}],page:0,size:20,totalElements:1}))))
 render(<MemoryRouter><MyAnswersPage/></MemoryRouter>);expect(await screen.findByText('Kendi deneyimim burada.')).toBeVisible();expect(screen.getByText('Kaldırıldı')).toBeVisible();expect(screen.getByRole('link',{name:'Soruyu aç'})).toHaveAttribute('href','/questions/q')
})
