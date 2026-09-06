import { render,screen,fireEvent,waitFor,act } from '@testing-library/react'
import { afterEach,beforeEach,expect,it,vi } from 'vitest'
import { OwnProfileAvatar } from './ProfileAvatar'
import { AvatarEditor } from './AvatarEditor'
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status})
beforeEach(()=>{vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:vi.fn(()=> 'blob:preview'),revokeObjectURL:vi.fn()}))})
afterEach(()=>vi.unstubAllGlobals())
it('shows missing selection instead of a permanently busy save button',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>json({fileId:null})))
 render(<AvatarEditor/>);const button=await screen.findByRole('button',{name:'Fotoğrafı kaydet'})
 expect(button).toBeEnabled();fireEvent.click(button);expect(await screen.findByRole('alert')).toHaveTextContent('Önce bir fotoğraf seç.')
 expect(button).toHaveAttribute('aria-busy','false')
})
it('previews a file, prevents duplicate upload and allows retry after failure',async()=>{
 let finish!:(r:Response)=>void
 const fetch=vi.fn(async(url:string,options:RequestInit)=>{
  if(url.endsWith('/csrf'))return json({token:'csrf'})
  if(options.method==='POST')return new Promise<Response>(resolve=>{finish=resolve})
  return json({fileId:null})
 })
 vi.stubGlobal('fetch',fetch);render(<><OwnProfileAvatar name="Ada Yılmaz"/><AvatarEditor/></>)
 const input=await screen.findByLabelText('Fotoğraf seç'),file=new File(['photo'],'photo.png',{type:'image/png'})
 fireEvent.change(input,{target:{files:[file]}})
 expect(await screen.findByAltText('Seçilen fotoğrafın önizlemesi')).toBeVisible()
 fireEvent.click(screen.getByRole('button',{name:'Fotoğrafı kaydet'}))
 expect(screen.getByRole('button',{name:'Kaydediliyor…'})).toBeDisabled()
 await waitFor(()=>expect(finish).toBeDefined())
 await act(async()=>finish(json({code:'STORAGE_UNAVAILABLE'},503)))
 expect(await screen.findByRole('alert')).toBeVisible();expect(screen.getByRole('button',{name:'Fotoğrafı kaydet'})).toBeEnabled()
 fireEvent.click(screen.getByRole('button',{name:'Fotoğrafı kaydet'}))
 await waitFor(()=>expect(fetch.mock.calls.filter(([,o])=>o.method==='POST')).toHaveLength(2))
 await act(async()=>finish(json({fileId:'saved'})))
 expect(await screen.findByAltText('Profil fotoğrafın')).toHaveAttribute('src',expect.stringContaining('/api/avatars/saved'))
 expect(await screen.findByAltText('Ada Yılmaz profil fotoğrafı')).toHaveAttribute('src',expect.stringContaining('/api/avatars/saved'))
 expect(screen.queryByAltText('Seçilen fotoğrafın önizlemesi')).not.toBeInTheDocument()
})
it('rejects oversized or unsupported selections before sending a request',async()=>{
 const fetch=vi.fn(async()=>json({fileId:null}));vi.stubGlobal('fetch',fetch);render(<AvatarEditor/>)
 fireEvent.change(await screen.findByLabelText('Fotoğraf seç'),{target:{files:[new File(['bad'],'photo.heic',{type:'image/heic'})]}})
 expect(await screen.findByRole('alert')).toHaveTextContent('JPEG veya PNG')
 expect(fetch).toHaveBeenCalledTimes(1)
})
