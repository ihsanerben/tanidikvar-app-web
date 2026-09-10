import { render,screen } from '@testing-library/react'
import { expect,it,vi } from 'vitest'
import { AboutPaletteDialog } from './AboutPaletteDialog'

it('briefly explains role, scope and Admin visual markers',()=>{
 render(<AboutPaletteDialog onClose={vi.fn()}/>)
 expect(screen.getByRole('dialog')).toBeVisible()
 expect(screen.getByText(/YKS adayı/)).toHaveTextContent('YKS adayı(Mavi)')
 expect(screen.getByText(/Üniversite öğrencisi/)).toHaveTextContent('Üniversite öğrencisi(Yeşil)')
 expect(screen.getByText(/Mezun/)).toHaveTextContent('Mezun(Kırmızı)')
 expect(screen.getByText('Üniversite + Bölüm')).toHaveClass('scope-university_department')
 expect(screen.getByRole('heading',{name:'Admin rozeti'})).toBeVisible()
 expect(screen.getByText('Altın çerçeve ve yıldızlar, sistemdeki Admin gösterimidir.')).toBeVisible()
 expect(document.querySelector('.about-admin-guide .profile-avatar-motif')).not.toBeNull()
 expect(document.querySelector('.about-admin-guide .profile-avatar-motif > span:last-child')).toHaveTextContent('★★★')
})
