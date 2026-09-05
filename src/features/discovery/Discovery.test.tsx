import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import { MemoryRouter,useNavigate } from 'react-router-dom'
import { afterEach,beforeEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { QuestionListPage } from '../questions/QuestionListPage'
import { AdminDirectoryPage } from './AdminDirectoryPage'
const stats={viewCount:15000,likeCount:500,communityAnswerCount:4,adminAnswerCount:8,totalAnswerCount:12}
const q={id:'question',authorId:'member',authorName:'Ada Yılmaz',title:'Işık kampüs hayatı nasıl?',body:null,scope:'GENERAL',universityId:null,universityName:null,universityDepartmentId:null,departmentId:null,departmentName:null,tags:[],createdAt:'2026-09-05T10:00:00Z',editedAt:null,archivedAt:null,version:0,statistics:stats}
const admin={id:'admin',name:'Çağrı Işık',activeAdmin:false,universityName:'Işık Üniversitesi',departmentName:'Bilgisayar Mühendisliği',educationStatus:'MEZUN',graduationYear:2025,biography:null,occupation:null,company:null,avatarFileId:null,answerCount:8}
const page=(items:unknown[]=[],number=0,total=items.length)=>({items,page:number,size:20,totalElements:total})
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status})
beforeEach(()=>setUser(null));afterEach(()=>vi.unstubAllGlobals())
function server(){const fetch=vi.fn(async(url:string)=>json(url.includes('/api/popular')||url.includes('/api/questions')?page([q]):url.includes('/api/admins')?page([admin]):page()));vi.stubGlobal('fetch',fetch);return fetch}
function renderList(url='/questions',popular=false){return render(<MemoryRouter initialEntries={[url]}><QuestionListPage popular={popular}/></MemoryRouter>)}
it('submits search with existing filters and resets pagination without writing views',async()=>{
 const fetch=server();renderList('/questions?universityId=university&tagId=tag&page=2')
 await screen.findByRole('heading',{name:q.title})
 fireEvent.change(screen.getByLabelText('Soru, üniversite, bölüm veya tag ara'),{target:{value:'isik'}});fireEvent.click(screen.getByRole('button',{name:'Ara'}))
 await waitFor(()=>expect(fetch.mock.calls.some(([url])=>url.includes('q=isik'))).toBe(true))
 const url=new URL(fetch.mock.calls.filter(([url])=>url.includes('/api/questions')).at(-1)![0]);expect(url.searchParams.get('universityId')).toBe('university');expect(url.searchParams.get('tagId')).toBe('tag');expect(url.searchParams.has('page')).toBe(false)
 expect(fetch.mock.calls.some(([url])=>url.includes('/views'))).toBe(false)
})
it('loads popular periods and keeps card totals independent of the selected period',async()=>{
 const fetch=server();renderList('/popular?period=DAILY&page=3&q=kampus',true)
 await screen.findByText('15.000 görüntülenme');expect(screen.getByText('Admin: 8')).toBeVisible()
 fireEvent.change(screen.getByLabelText('Zaman aralığı'),{target:{value:'YEARLY'}})
 await waitFor(()=>expect(fetch.mock.calls.some(([url])=>url.includes('period=YEARLY'))).toBe(true))
 const url=new URL(fetch.mock.calls.filter(([url])=>url.includes('/api/popular')).at(-1)![0]);expect(url.searchParams.get('q')).toBe('kampus');expect(url.searchParams.has('page')).toBe(false)
 expect(screen.getByText(/Kartlardaki sayılar tüm zamanların toplamıdır/)).toBeVisible()
})
it('preserves the period when clearing filters and supports empty results',async()=>{
 const fetch=server();fetch.mockImplementation(async()=>json(page()));renderList('/popular?period=MONTHLY&q=deneme&adminId=admin',true)
 await screen.findByRole('heading',{name:'Bu dönemde popüler soru yok.'})
 fireEvent.click(screen.getByText('Soruları filtrele'));fireEvent.click(screen.getByRole('button',{name:'Filtreleri temizle'}))
 await waitFor(()=>expect(fetch.mock.calls.some(([url])=>url.endsWith('/api/popular?period=MONTHLY'))).toBe(true))
 expect(screen.getByLabelText('Soru, üniversite, bölüm veya tag ara')).toHaveValue('');expect(screen.queryByRole('button',{name:'Admin filtresini kaldır'})).not.toBeInTheDocument()
})
it('retries a failed popularity request',async()=>{
 const fetch=server(),normal=fetch.getMockImplementation()!;let failed=false;fetch.mockImplementation(async(url)=>{if(url.includes('/api/popular')&&!failed){failed=true;return json({code:'SERVICE_UNAVAILABLE'},503)}return normal(url)})
 renderList('/popular',true);fireEvent.click(await screen.findByRole('button',{name:'Tekrar dene'}));await screen.findByRole('heading',{name:q.title})
})
it('uses URL state when moving back through search history',async()=>{
 server();function Back(){const navigate=useNavigate();return <button onClick={()=>navigate(-1)}>Geri</button>}
 render(<MemoryRouter initialEntries={['/questions?q=kampus','/questions?q=isik']}><Back/><QuestionListPage/></MemoryRouter>)
 expect(screen.getByLabelText('Soru, üniversite, bölüm veya tag ara')).toHaveValue('isik');fireEvent.click(screen.getByRole('button',{name:'Geri'}));expect(screen.getByLabelText('Soru, üniversite, bölüm veya tag ara')).toHaveValue('kampus');await screen.findByRole('heading',{name:q.title})
})
it('does not display an old response after a newer search succeeds',async()=>{
 const fetch=server(),normal=fetch.getMockImplementation()!;let resolveOld:((r:Response)=>void)|undefined
 fetch.mockImplementation(async(url)=>url.includes('/api/questions?')&&!url.includes('q=new')?new Promise<Response>(resolve=>{resolveOld=resolve}):normal(url))
 renderList();fireEvent.change(screen.getByLabelText('Soru, üniversite, bölüm veya tag ara'),{target:{value:'new'}});fireEvent.click(screen.getByRole('button',{name:'Ara'}));await screen.findByRole('heading',{name:q.title})
 resolveOld?.(json(page([{...q,title:'Eski arama sonucu'}])));await waitFor(()=>expect(screen.queryByRole('heading',{name:'Eski arama sonucu'})).not.toBeInTheDocument())
})
it('searches admin names and links public profiles and answered questions with former status',async()=>{
 const fetch=server();render(<MemoryRouter initialEntries={['/admins?page=2']}><AdminDirectoryPage/></MemoryRouter>)
 await screen.findByRole('link',{name:admin.name});expect(screen.getByText('ARTIK ADMIN DEĞİL')).toBeVisible();expect(screen.getByRole('link',{name:'Cevapladığı soruları keşfet'})).toHaveAttribute('href','/questions?adminId=admin')
 fireEvent.change(screen.getByLabelText('Admin adı ara'),{target:{value:'cagri'}});fireEvent.click(screen.getByRole('button',{name:'Ara'}));await waitFor(()=>expect(fetch.mock.calls.some(([url])=>url.endsWith('/api/admins?q=cagri'))).toBe(true))
 expect(screen.getByRole('link',{name:admin.name})).toHaveAttribute('href','/admins/admin')
})
it('handles admin directory errors and empty states',async()=>{
 let attempts=0;vi.stubGlobal('fetch',vi.fn(async()=>++attempts===1?json({code:'SERVICE_UNAVAILABLE'},503):json(page())))
 render(<MemoryRouter><AdminDirectoryPage/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'Tekrar dene'}));await screen.findByRole('heading',{name:'Admin bulunamadı.'})
})
