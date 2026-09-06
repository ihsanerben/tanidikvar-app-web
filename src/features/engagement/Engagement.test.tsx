import { createOpening,type Opening } from './opening'
import { StrictMode } from 'react'
import { render,screen,fireEvent,waitFor,act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach,beforeEach,expect,it,vi } from 'vitest'
import { setUser } from '../auth/authStore'
import { QuestionEngagement } from './QuestionEngagement'
import { statistics } from './engagementApi'
const initial={viewCount:0,likeCount:0,communityAnswerCount:0,adminAnswerCount:0,totalAnswerCount:0}
const json=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status})
beforeEach(()=>setUser(null))
afterEach(()=>vi.unstubAllGlobals())
function server(){
 let likes={liked:false,version:0},views=0
 const fetch=vi.fn(async(url:string,options:RequestInit)=>{
  if(url.endsWith('/csrf'))return json({token:'csrf'})
  if(url.endsWith('/views')){views++;return new Response(null,{status:204})}
  if(url.endsWith('/statistics'))return json({...initial,viewCount:views,likeCount:likes.liked?1:0})
  if(url.endsWith('/like')){if(options.method==='PUT'){const body=JSON.parse(String(options.body));likes={liked:body.liked,version:likes.version+1}}return json(likes)}
  throw new Error('Unexpected test route')
 });vi.stubGlobal('fetch',fetch);return fetch
}
function ui(opening:Opening=createOpening('opening'),revision=0,archived=false){return <MemoryRouter><QuestionEngagement questionId="question" initial={initial} archived={archived} opening={opening} answersRevision={revision}/></MemoryRouter>}
it('records one anonymous visible opening under StrictMode and refreshes counts without a visitor identity',async()=>{
 const fetch=server(),opening=createOpening('opening');const view=render(<StrictMode>{ui(opening)}</StrictMode>)
 await screen.findByText('1 görüntülenme')
 view.rerender(<StrictMode>{ui(opening,1)}</StrictMode>);await waitFor(()=>expect(fetch.mock.calls.filter(([url])=>url.endsWith('/statistics')).length).toBeGreaterThan(1))
 const writes=fetch.mock.calls.filter(([url])=>url.endsWith('/views'))
 expect(writes).toHaveLength(1);expect(JSON.parse(String(writes[0][1].body))).toEqual({openingEventId:'opening'})
 expect(writes[0][1].headers).toMatchObject({'X-XSRF-TOKEN':'csrf'});expect(writes[0][1].credentials).toBe('include')
 expect(screen.getByRole('link',{name:'Beğenmek için giriş yap'})).toBeVisible()
})
it('waits until a background detail becomes visible and does not recount focus changes',async()=>{
 const fetch=server();let visibility='hidden';vi.spyOn(document,'visibilityState','get').mockImplementation(()=>visibility as DocumentVisibilityState)
 render(ui());await screen.findByText('0 görüntülenme');expect(fetch.mock.calls.filter(([url])=>url.endsWith('/views'))).toHaveLength(0)
 visibility='visible';fireEvent(document,new Event('visibilitychange'));await screen.findByText('1 görüntülenme')
 visibility='hidden';fireEvent(document,new Event('visibilitychange'));visibility='visible';fireEvent(document,new Event('visibilitychange'))
 expect(fetch.mock.calls.filter(([url])=>url.endsWith('/views'))).toHaveLength(1)
 vi.restoreAllMocks()
})
it('retries an uncertain view with the same opening identity',async()=>{
 const fetch=server(),normal=fetch.getMockImplementation()!;let tries=0
 fetch.mockImplementation(async(url,o)=>{if(url.endsWith('/views')&&++tries===1)throw new TypeError('connection');return normal(url,o)})
 render(ui());fireEvent.click(await screen.findByRole('button',{name:'Görüntülenmeyi tekrar kaydet'}));await screen.findByText('1 görüntülenme')
 const writes=fetch.mock.calls.filter(([url])=>url.endsWith('/views'));expect(writes).toHaveLength(2);expect(writes[0][1].body).toEqual(writes[1][1].body)
})
it('likes, unlikes and relikes with the returned version and updates totals',async()=>{
 const fetch=server();setUser({id:'member',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true});render(ui())
 fireEvent.click(await screen.findByRole('button',{name:'Beğen'}));await screen.findByText('1')
 expect(screen.getByRole('button',{name:'Beğeniyi geri al'})).toHaveAttribute('aria-pressed','true')
 fireEvent.click(screen.getByRole('button',{name:'Beğeniyi geri al'}));await screen.findByText('0')
 fireEvent.click(screen.getByRole('button',{name:'Beğen'}));await screen.findByText('1')
 expect(fetch.mock.calls.filter(([,o])=>o.method==='PUT').map(([,o])=>JSON.parse(String(o.body)))).toEqual([{liked:true,version:0},{liked:false,version:1},{liked:true,version:2}])
})
it('requires a profile and discards private like state when the account changes',async()=>{
 server();setUser({id:'member',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true});render(ui())
 await screen.findByRole('button',{name:'Beğen'})
 act(()=>setUser({id:'other',email:'other@example.test',role:'USER',profileCompleted:false}))
 expect(screen.getByRole('link',{name:'Beğenmek için profilini tamamla'})).toBeVisible();expect(screen.queryByRole('button',{name:'Beğen'})).not.toBeInTheDocument()
})
it('keeps a stale like state until explicit reload and prevents additional writes',async()=>{
 const fetch=server(),normal=fetch.getMockImplementation()!;fetch.mockImplementation(async(url,o)=>o.method==='PUT'?json({code:'STALE_VERSION'},409):normal(url,o))
 setUser({id:'member',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true});render(ui())
 fireEvent.click(await screen.findByRole('button',{name:'Beğen'}));await screen.findByRole('button',{name:'Beğeni durumunu yenile'})
 expect(screen.getByRole('button',{name:'Beğen'})).toBeDisabled();expect(screen.getByText('0')).toBeVisible()
 fireEvent.click(screen.getByRole('button',{name:'Beğeni durumunu yenile'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Beğen'})).toBeEnabled())
})
it('allows removing an existing like on an archived question, then prevents reliking',async()=>{
 const fetch=server(),normal=fetch.getMockImplementation()!;let removed=false
 fetch.mockImplementation(async(url,o)=>{if(url.endsWith('/like')){if(o.method==='PUT')removed=true;return json({liked:!removed,version:removed?2:1})}return normal(url,o)})
 setUser({id:'member',email:'test@example.test',role:'YKS_ADAYI',profileCompleted:true});render(ui(createOpening('opening'),0,true))
 fireEvent.click(await screen.findByRole('button',{name:'Beğeniyi geri al'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Beğen'})).toBeDisabled())
})
it('rejects negative, unsafe or inconsistent counters',()=>{
 expect(()=>statistics({...initial,viewCount:-1})).toThrow();expect(()=>statistics({...initial,viewCount:Number.MAX_SAFE_INTEGER+1})).toThrow();expect(()=>statistics({...initial,totalAnswerCount:1})).toThrow()
})
