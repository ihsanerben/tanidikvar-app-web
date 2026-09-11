import { fireEvent,render,screen } from '@testing-library/react'
import { expect,it,vi } from 'vitest'
import { AboutPaletteDialog } from './AboutPaletteDialog'
import { AboutPage } from './HomePage'

it('briefly explains role, scope and Admin visual markers',()=>{
 render(<AboutPaletteDialog onClose={vi.fn()}/>)
 expect(screen.getByRole('dialog')).toBeVisible()
 expect(screen.getByText(/YKS adayı/)).toHaveTextContent('YKS adayı(Mavi)')
 expect(screen.getByText(/Üniversite öğrencisi/)).toHaveTextContent('Üniversite öğrencisi(Yeşil)')
 expect(screen.getByText(/Mezun/)).toHaveTextContent('Mezun(Kırmızı)')
 expect(screen.getByText('Üniversite + Bölüm')).toHaveClass('scope-university_department')
 expect(screen.getByRole('heading',{name:'1 — Kullanıcı rolleri'})).toBeVisible()
 expect(screen.getByRole('heading',{name:'2 — Soru kapsamı'})).toBeVisible()
 expect(screen.getByRole('heading',{name:'3 — Admin rozeti'})).toBeVisible()
 expect(screen.getByText('Altın çerçeve ve yıldızlar, sistemdeki Admin gösterimidir.')).toBeVisible()
 expect(document.querySelector('.about-admin-guide .profile-avatar-motif')).not.toBeNull()
 expect(document.querySelector('.about-admin-guide .profile-avatar-motif > span:last-child')).toHaveTextContent('★★★')
})

it('opens on the about page and leaves the page visible after closing',()=>{
 render(<AboutPage/>)
 const dialog=screen.getByRole('dialog')
 expect(dialog).toBeVisible()
 fireEvent(dialog,new Event('close'))
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
 expect(screen.getByRole('heading',{name:/Tercih yolunda/})).toBeVisible()
})
