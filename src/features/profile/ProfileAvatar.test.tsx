import { render } from '@testing-library/react'
import { expect,it } from 'vitest'
import { ProfileAvatar } from './ProfileAvatar'

function starCount(educationStatus:string){
 const {container}=render(<ProfileAvatar name="Ada Yılmaz" isAdmin educationStatus={educationStatus}/>)
 return container.querySelector('.profile-avatar-motif > span[aria-hidden="true"]')?.textContent
}

it.each([
 ['YKS_ADAYI','★'],
 ['UNIVERSITE_OGRENCISI','★★'],
 ['MEZUN','★★★'],
])('shows the Admin star level for %s', (educationStatus,stars)=>{
 expect(starCount(educationStatus)).toBe(stars)
})

it('does not decorate non-Admin profiles with stars',()=>{
 const {container}=render(<ProfileAvatar name="Ada Yılmaz" educationStatus="MEZUN"/>)
 expect(container.querySelector('.profile-avatar-motif')).toBeNull()
})
