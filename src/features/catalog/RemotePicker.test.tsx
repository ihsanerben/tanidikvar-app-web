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
it('orders every fetched choice using the Turkish alphabet',async()=>{
 const items=[{id:'3',name:'Üniversite 10',deletedAt:null,version:0},{id:'1',name:'İstanbul',deletedAt:null,version:0},{id:'2',name:'Izmir',deletedAt:null,version:0},{id:'4',name:'Üniversite 2',deletedAt:null,version:0}]
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({items,page:0,size:100,totalElements:items.length}))))
 render(<RemotePicker label="Üniversite" endpoint="/api/universities" value={null} onChange={()=>{}}/>)
 await screen.findByRole('option',{name:'İstanbul'})
 expect(screen.getAllByRole('option').map(option=>option.textContent)).toEqual(['Seç','Izmir','İstanbul','Üniversite 2','Üniversite 10'])
})
