import { render,screen,fireEvent,waitFor } from '@testing-library/react'
import { MemoryRouter,Routes,Route } from 'react-router-dom'
import { beforeEach,afterEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { QuestionFormPage } from './QuestionFormPage'
import { QuestionDetailPage } from './QuestionDetailPage'
import { QuestionListPage } from './QuestionListPage'
const q={id:'question',authorId:'member',authorName:'Ada Yılmaz',title:'Üniversitede kampüs hayatı nasıl?',body:'<script>alert(1)</script>',scope:'GENERAL',universityId:null,universityName:null,universityDepartmentId:null,departmentId:null,departmentName:null,tags:[],createdAt:'2026-09-05T10:00:00Z',editedAt:null,archivedAt:null,version:0,statistics:{viewCount:0,likeCount:0,communityAnswerCount:0,adminAnswerCount:0,totalAnswerCount:0}}
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status})
const empty={items:[],page:0,size:20,totalElements:0}
beforeEach(()=>setUser({id:'member',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true}))
afterEach(()=>vi.unstubAllGlobals())
function form(edit=false){render(<MemoryRouter initialEntries={[edit?'/questions/question/edit':'/questions/new']}><Routes><Route path="/questions/new" element={<QuestionFormPage/>}/><Route path="/questions/:id/edit" element={<QuestionFormPage edit/>}/><Route path="/questions/:id" element={<QuestionDetailPage/>}/></Routes></MemoryRouter>)}
it('requires login and a complete profile to create a question',()=>{
  setUser({id:'member',email:'test@example.test',role:'USER',profileCompleted:false});form()
  expect(screen.getByRole('link',{name:'Profilini tamamla'})).toHaveAttribute('href','/profile')
  expect(screen.queryByLabelText('Soru başlığı')).not.toBeInTheDocument()
})
it('keeps form and request identity after unknown network result, then navigates after retry',async()=>{
  let attempts=0
  const fetch=vi.fn(async(url:string,options:RequestInit)=>{
    if(url.endsWith('/csrf'))return json({token:'csrf'})
    if(url.endsWith('/views'))return new Response(null,{status:204})
    if(options.method==='POST'){if(++attempts===1)throw new TypeError('lost response');return json(q,201)}
    return json(url.endsWith('/api/questions/question')?q:empty)
  });vi.stubGlobal('fetch',fetch);form()
  fireEvent.change(screen.getByLabelText('Soru başlığı'),{target:{value:q.title}})
  fireEvent.click(screen.getByRole('button',{name:'Soruyu yayınla'}));await screen.findByRole('alert')
  expect(screen.getByLabelText('Soru başlığı')).toHaveValue(q.title)
  fireEvent.click(screen.getByRole('button',{name:'Soruyu yayınla'}))
  await screen.findByRole('heading',{name:q.title})
  const writes=fetch.mock.calls.filter(([url,o])=>o.method==='POST'&&!url.endsWith('/views'))
  expect(writes).toHaveLength(2);expect(writes[0][1].body).toEqual(writes[1][1].body)
  expect(writes[0][1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'})
})
it('maps nested backend validation fields to the title input',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='POST'?json({code:'VALIDATION_FAILED',fieldErrors:{'content.title':'invalid'}},400):json(empty)))
  form();fireEvent.change(screen.getByLabelText('Soru başlığı'),{target:{value:q.title}});fireEvent.click(screen.getByRole('button',{name:'Soruyu yayınla'}))
  await waitFor(()=>expect(screen.getByLabelText('Soru başlığı')).toHaveAttribute('aria-invalid','true'))
  expect(screen.getByLabelText('Soru başlığı')).toHaveAccessibleDescription('Soru başlığı 10–200 karakter olmalı.')
})
it('preserves edits and offers an explicit reload for stale versions',async()=>{
  vi.stubGlobal('fetch',vi.fn(async(url:string,options:RequestInit)=>url.endsWith('/csrf')?json({token:'csrf'}):options.method==='PUT'?json({code:'STALE_VERSION'},409):json(url.endsWith('/tags')?empty:q)))
  form(true);fireEvent.change(await screen.findByLabelText('Soru başlığı'),{target:{value:'Kaydedilmeyen yeni soru başlığı'}})
  fireEvent.click(screen.getByRole('button',{name:'Değişiklikleri kaydet'}));await screen.findByRole('button',{name:'Güncel soruyu yükle'})
  expect(screen.getByLabelText('Soru başlığı')).toHaveValue('Kaydedilmeyen yeni soru başlığı')
})
it('renders user text safely and hides owner actions from other accounts',async()=>{
  setUser({id:'other',email:'other@example.test',role:'ADMIN',profileCompleted:true})
  vi.stubGlobal('fetch',vi.fn(async()=>json(q)))
  render(<MemoryRouter initialEntries={['/questions/question']}><Routes><Route path="/questions/:id" element={<QuestionDetailPage/>}/></Routes></MemoryRouter>)
  await screen.findByRole('heading',{name:q.title})
  expect(screen.getByText(q.body)).toBeVisible();expect(document.querySelector('script')).toBeNull()
  expect(screen.queryByRole('link',{name:'Soruyu düzenle'})).not.toBeInTheDocument()
})
it('shows archived detail without edit or archive controls',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>json({...q,archivedAt:q.createdAt})))
  render(<MemoryRouter initialEntries={['/questions/question']}><Routes><Route path="/questions/:id" element={<QuestionDetailPage/>}/></Routes></MemoryRouter>)
  await screen.findByText(/Bu soru arşivlendi/)
  expect(screen.queryByRole('button',{name:'Arşivle'})).not.toBeInTheDocument()
  expect(screen.queryByRole('link',{name:'Soruyu düzenle'})).not.toBeInTheDocument()
})
it('shows an empty list and supports retrying a failed list request',async()=>{
  let calls=0;vi.stubGlobal('fetch',vi.fn(async()=>++calls===1?json({code:'SERVICE_UNAVAILABLE'},503):json(empty)))
  render(<MemoryRouter><QuestionListPage/></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button',{name:'Tekrar dene'}))
  await screen.findByRole('heading',{name:'Henüz soru yok.'})
})

it('admin cannot open question creation',()=>{
 setUser({id:'admin',email:'test@example.test',role:'ADMIN',profileCompleted:true});form()
 expect(screen.queryByLabelText('Soru başlığı')).not.toBeInTheDocument()
 expect(screen.getByRole('link',{name:'Soruları keşfet'})).toBeVisible()
})
it('defaults to admin answers and switches the visible answer type',async()=>{
 setUser(null);vi.stubGlobal('fetch',vi.fn(async(url:string)=>json(url.endsWith('/api/questions/question')?q:url.endsWith('/statistics')?q.statistics:url.endsWith('/csrf')?{token:'csrf'}:empty)))
 render(<MemoryRouter initialEntries={['/questions/question']}><Routes><Route path="/questions/:id" element={<QuestionDetailPage/>}/></Routes></MemoryRouter>)
 expect(await screen.findByRole('tab',{name:'Admin cevapları'})).toHaveAttribute('aria-selected','true')
 expect(screen.queryByRole('heading',{name:'Topluluk cevapları'})).not.toBeInTheDocument()
 fireEvent.click(screen.getByRole('tab',{name:'Topluluk cevapları'}))
 expect(screen.getByRole('heading',{name:'Topluluk cevapları'})).toBeVisible()
 expect(screen.queryByRole('heading',{name:'Admin Cevapları'})).not.toBeInTheDocument()
})
