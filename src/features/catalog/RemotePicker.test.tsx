import { render,screen,waitFor,act } from '@testing-library/react'
import { afterEach,expect,it,vi } from 'vitest'
import { RemotePicker } from './RemotePicker'
afterEach(()=>vi.unstubAllGlobals())
it('hides old choices immediately when the catalog endpoint changes',async()=>{
 let resolve!:(value:Response)=>void
 const response=(name:string)=>new Response(JSON.stringify({items:[{id:name,name,deletedAt:null,version:0}],page:0,size:20,totalElements:1}))
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>url.includes('/first')?response('İlk seçenek'):new Promise<Response>(r=>{resolve=r})))
 const {rerender}=render(<RemotePicker label="Seçenek" endpoint="/first" value={null} onChange={()=>{}}/>)
 await screen.findByRole('option',{name:'İlk seçenek'})
 rerender(<RemotePicker label="Seçenek" endpoint="/second" value={null} onChange={()=>{}}/>)
 expect(screen.getByLabelText('Seçenek')).toBeDisabled();expect(screen.queryByRole('option',{name:'İlk seçenek'})).not.toBeInTheDocument()
 await waitFor(()=>expect(resolve).toBeDefined());await act(async()=>resolve(response('İkinci seçenek')))
 expect(await screen.findByRole('option',{name:'İkinci seçenek'})).toBeVisible()
})
