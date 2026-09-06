import { expect,test,type Page } from '@playwright/test'
const empty={items:[],page:0,size:10,totalElements:0}
const profile={firstName:'Ada',lastName:'Yılmaz',educationStatus:'UNIVERSITE_OGRENCISI',education:{id:'e',universityId:'u',universityName:'Test Üniversitesi',departmentId:'d',departmentName:'Bilgisayar',available:true,deletedAt:null,version:0},graduationYear:null,biography:null,occupation:null,company:null,linkedinUrl:'https://linkedin.com/in/example',portfolioUrl:'https://example.com',completed:true,version:1}
async function mock(page:Page){let liked=false,version=0
 await page.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname,method=route.request().method();let data:unknown=empty
 if(path==='/api/me')data={id:'admin',email:'admin@example.test',role:'ADMIN',profileCompleted:true}
 else if(path==='/api/me/profile')data=profile
 else if(path==='/api/me/avatar')data={fileId:null}
 else if(path==='/api/auth/csrf')data={token:'csrf'}
 else if(path.endsWith('/like')){if(method==='PUT'){liked=route.request().postDataJSON().liked;version++}data={liked,version}}
 else if(path.endsWith('/statistics'))data={viewCount:11,likeCount:liked?1:0,communityAnswerCount:0,adminAnswerCount:0,totalAnswerCount:0}
 else if(path==='/api/questions/question')data={id:'question',authorId:'other',authorName:'Deniz',title:'Üniversitede kampüs hayatı nasıl?',body:null,scope:'GENERAL',universityId:null,universityName:null,universityDepartmentId:null,departmentId:null,departmentName:null,tags:[],createdAt:'2026-09-05T10:00:00Z',editedAt:null,archivedAt:null,version:0,statistics:{viewCount:11,likeCount:0,communityAnswerCount:0,adminAnswerCount:0,totalAnswerCount:0}}
 else if(path.endsWith('/my-admin-answer'))data={answer:null,assignment:{questionId:'question',questionTitle:'Üniversitede kampüs hayatı nasıl?',assigned:false,version:0,assignedAt:null,archivedAt:null}}
 else if(path.endsWith('/admin-quota'))data={activeAdmin:true,day:'2026-09-06',used:0,limit:5,remaining:5,resetsAt:'2026-09-06T21:00:00Z'}
 else if(path.endsWith('/my-answer')||path.endsWith('/views')){await route.fulfill({status:204});return}
 await route.fulfill({json:data})
 })
}
test('heart is in the stats row; answer tabs preserve position and composers are dialogs',async({page})=>{
 await mock(page);await page.goto('/questions/question')
 const stats=page.getByLabel('Soru istatistikleri'),like=stats.getByRole('button',{name:'Beğen',exact:true})
 await expect(like).toBeVisible();await like.click();await expect(stats.getByRole('button',{name:'Beğeniyi geri al'})).toHaveText('1')
 await stats.getByRole('button',{name:'Beğeniyi geri al'}).click();await expect(like).toHaveText('0')
 await expect(page.getByRole('tab',{name:'Admin cevapları'})).toHaveAttribute('aria-selected','true')
 await page.getByRole('button',{name:'Admin cevabı ekle'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Vazgeç'}).click()
 await page.getByRole('tab',{name:'Topluluk cevapları'}).scrollIntoViewIfNeeded();await page.waitForTimeout(400)
 const y=await page.evaluate(()=>scrollY)
 await page.getByRole('tab',{name:'Topluluk cevapları'}).click();await page.getByRole('button',{name:'Topluluk cevabı ekle'}).waitFor();await page.waitForTimeout(400)
 expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(3)
 await page.getByRole('button',{name:'Topluluk cevabı ekle'}).click();await expect(page.getByRole('dialog')).toBeVisible()
 await page.getByRole('button',{name:'Vazgeç'}).click();await expect(page.getByText('İşlem iptal edildi.').last()).toBeVisible()
})
test('admin keeps application history and education role; photo editor opens from heading',async({page})=>{
 await mock(page);await page.goto('/account')
 await expect(page.locator('.account-summary')).toContainText('Üniversite Öğrencisi')
 await expect(page.locator('.account-menu-button')).toHaveClass(/is-admin/)
 await expect(page.getByRole('link',{name:'LinkedIn ↗'})).toHaveCSS('background-color','rgb(227, 243, 252)')
 await page.getByRole('link',{name:'Admin başvurularım'}).click();await expect(page.getByRole('heading',{name:'Başvurularım'})).toBeVisible();await expect(page.getByLabel('e-Devlet öğrenci / mezun belgesi')).toHaveCount(0)
 await page.goto('/profile');await expect(page.getByLabel('Meslek',{exact:true})).toHaveCount(0);await expect(page.getByLabel('Şirket',{exact:true})).toHaveCount(0)
 await page.getByRole('button',{name:'Profil fotoğrafını düzenle'}).click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByLabel('Fotoğraf seç')).toBeVisible()
})
