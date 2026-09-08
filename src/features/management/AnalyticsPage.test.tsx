import { fireEvent,render,screen,waitFor } from '@testing-library/react'
import { afterEach,expect,it,vi } from 'vitest'
import { AnalyticsPage } from './AnalyticsPage'

const values={users:2,questions:3,communityAnswers:4,adminAnswers:1,views:20,likes:5,applications:2,approvedApplications:1,rejectedApplications:1}
const response={dateFrom:'2026-09-01',dateTo:'2026-09-03',timezone:'Europe/Istanbul',totals:values,points:[{date:'2026-09-01',...values},{date:'2026-09-02',...Object.fromEntries(Object.keys(values).map(k=>[k,0]))},{date:'2026-09-03',...values}]}
afterEach(()=>vi.unstubAllGlobals())
it('renders period totals, accessible charts and applies a custom range',async()=>{
 const fetch=vi.fn(async(_input:RequestInfo|URL)=>new Response(JSON.stringify(response)));vi.stubGlobal('fetch',fetch);render(<AnalyticsPage/>)
 await screen.findByRole('heading',{name:'Büyüme'});expect(screen.getAllByText('20').length).toBeGreaterThan(0);expect(screen.getAllByRole('img')).toHaveLength(4);expect(screen.getByText('3 gün · Europe/Istanbul')).toBeVisible()
 fireEvent.change(screen.getByLabelText('Başlangıç tarihi'),{target:{value:'2026-09-01'}});fireEvent.change(screen.getByLabelText('Bitiş tarihi'),{target:{value:'2026-09-03'}});fireEvent.click(screen.getByRole('button',{name:'Grafikleri getir'}))
 await waitFor(()=>expect(fetch.mock.calls.some(([url])=>String(url).includes('dateFrom=2026-09-01&dateTo=2026-09-03'))).toBe(true))
 fireEvent.click(screen.getByText('Günlük verileri tablo olarak göster'));expect(screen.getByRole('table')).toBeVisible()
})
it('clears a previous error while a new date preset loads',async()=>{
 let resolve!:(value:Response)=>void,calls=0
 vi.stubGlobal('fetch',vi.fn(async()=>++calls===1?new Response(JSON.stringify({code:'INVALID_DATE_RANGE'}),{status:400}):new Promise<Response>(r=>{resolve=r})))
 render(<AnalyticsPage/>);await screen.findByRole('alert')
 fireEvent.click(screen.getByRole('button',{name:'Son 7 gün'}))
 expect(screen.queryByRole('alert')).not.toBeInTheDocument();expect(screen.getByText('Grafikler yükleniyor…')).toBeVisible()
 await waitFor(()=>expect(calls).toBe(2));resolve(new Response(JSON.stringify(response)))
 await screen.findByRole('heading',{name:'Büyüme'})
})
