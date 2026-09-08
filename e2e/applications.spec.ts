import { expect,test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { account,completeProfile,promoteTestManager,mutation } from './accounts'
test('application decisions, private files, admin comments, revocation and account moderation',async({page,request,browser},info)=>{
 test.setTimeout(180_000)
 const managerEmail=await account(page,request);promoteTestManager(managerEmail)
 const context=await browser.newContext({baseURL:info.project.use.baseURL,viewport:info.project.use.viewport}),student=await context.newPage()
 const email=await account(student,request),suffix=randomUUID().slice(0,8)
 await completeProfile(student,'UNIVERSITE_OGRENCISI','Başvuru '+suffix)
 const user=(await (await student.request.get('/api/me')).json())
 await student.goto('/applications')
 const file={name:'test.pdf',mimeType:'application/pdf',buffer:readFileSync(new URL('../public/guides/tanidikvar-kullanim-rehberi.pdf',import.meta.url))}
 async function submit(){await student.getByLabel('e-Devlet öğrenci / mezun belgesi').setInputFiles(file);await student.getByRole('button',{name:'Başvuruyu gönder'}).click();await expect(student.getByText('İnceleme bekliyor',{exact:true})).toBeVisible()}
 await submit();const first=(await (await student.request.get('/api/me/admin-applications')).json()).items[0]
 expect((await request.get('/api/files/'+first.documentFileId+'/download')).status()).toBe(401)
 const download=student.waitForEvent('download');await student.getByRole('button',{name:'Belgeyi indir'}).click();expect((await download).suggestedFilename()).toBe('belge.pdf')
 await page.goto('/manager/applications/'+first.id);await expect(page.getByTitle('Başvuru belgesi')).toBeVisible()
 let card=page.locator('.application-review-grid .application-card')
 await card.getByRole('button',{name:'Reddet',exact:true}).click();await card.getByLabel('Gerekçe').fill('Daha okunaklı belge yükle.')
 await card.getByRole('button',{name:'Kararı onayla'}).click();await expect(card.getByText('Reddedildi',{exact:true})).toBeVisible()
 await student.reload();await expect(student.getByText('Ret gerekçesi: Daha okunaklı belge yükle.')).toBeVisible();await submit()
 const second=(await (await student.request.get('/api/me/admin-applications')).json()).items[0]
 await page.goto('/manager/applications/'+second.id);card=page.locator('.application-review-grid .application-card')
 await card.getByRole('button',{name:'Kabul et',exact:true}).click();await card.getByRole('button',{name:'Kararı onayla'}).click();await expect(card.getByText('Güncel doğrulama',{exact:true})).toBeVisible()
 await student.reload();expect((await (await student.request.get('/api/me')).json()).role).toBe('ADMIN')
 const question=await mutation(student.request,'/api/questions',{requestId:randomUUID(),content:{title:'Doğrulanmış deneyim sorusu '+suffix,scope:'GENERAL',tagIds:[]}})
 await student.goto('/questions/'+question.id);await student.getByRole('button',{name:'Admin yorumu yaz'}).click()
 await student.getByRole('textbox',{name:'Admin yorumun',exact:true}).fill('Bölümde uygulamalı projeler ve stajlar çok faydalı oldu.')
 await student.getByRole('button',{name:'Admin yorumunu yayınla'}).click();await expect(student.getByRole('tab',{name:'Admin yorumları (1)'})).toBeVisible()
 await student.locator('.own-answer').getByRole('button',{name:'Düzenle',exact:true}).click();await student.getByRole('textbox',{name:'Admin yorumunu düzenle'}).fill('Güncel deneyim: projeler ve stajlar iş hayatına hazırladı.')
 await student.getByRole('button',{name:'Admin yorum değişikliklerini kaydet'}).click();await expect(student.getByRole('dialog')).toHaveCount(0)
 await student.locator('.own-answer').getByRole('button',{name:'Sil',exact:true}).click();await expect(student.getByRole('button',{name:'Geri yükle',exact:true})).toBeVisible()
 await student.getByRole('button',{name:'Geri yükle',exact:true}).click();await expect(student.getByRole('tab',{name:'Admin yorumları (1)'})).toBeVisible()
 await student.goto('/admin');await expect(student.getByText('Kalan yorum hakkın: 4 / 5')).toBeVisible()
 await student.goto('/admins/'+user.id);await expect(student.getByRole('heading',{level:1})).toContainText('Deniz')
 await student.goto('/profiles/'+user.id);await expect(student.getByText('Güncel deneyim: projeler ve stajlar iş hayatına hazırladı.',{exact:true})).toBeVisible()
 await page.goto('/manager/users/'+user.id);await page.getByRole('button',{name:'Admin yetkisini kaldır',exact:true}).click();await page.getByLabel('İşlem gerekçesi').fill('Yeniden doğrulama gerekiyor.')
 await page.getByRole('button',{name:'Admin yetkisini kaldır — onayla'}).click();await expect(page.getByText('Aktif Admin doğrulaması yok',{exact:true})).toBeVisible()
 await student.goto('/applications');await expect(student.getByLabel('e-Devlet öğrenci / mezun belgesi')).toBeVisible();await submit()
 await page.goto('/manager/users/'+user.id);await page.getByRole('link',{name:'Başvuru geçmişi',exact:true}).click();await expect(page.getByRole('heading',{level:1,name:'Başvuru geçmişi'})).toBeVisible()
 await page.goto('/manager/users/'+user.id);await page.getByRole('button',{name:'Hesabı pasifleştir',exact:true}).click();await page.getByLabel('İşlem gerekçesi').fill('Hesap incelemesi')
 await page.getByRole('button',{name:'Hesabı pasifleştir — onayla'}).click();await expect(page.getByRole('button',{name:'Hesabı geri yükle',exact:true})).toBeVisible()
 expect((await student.request.get('/api/me')).status()).toBe(401)
 await page.getByRole('button',{name:'Hesabı geri yükle',exact:true}).click();await page.getByLabel('İşlem gerekçesi').fill('İnceleme tamamlandı')
 await page.getByRole('button',{name:'Hesabı geri yükle — onayla'}).click();await expect(page.getByRole('button',{name:'Hesabı pasifleştir',exact:true})).toBeVisible();expect((await student.request.get('/api/me')).status()).toBe(401)
 // Avatar lifecycle remains independent of account education, and old public URLs close on removal.
 await page.goto('/manager/account');await page.getByRole('button',{name:'Profil fotoğrafını düzenle'}).click()
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB1sAAAAASUVORK5CYII=','base64')
 await page.getByLabel('Fotoğraf seç').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:png});await page.getByRole('button',{name:'Fotoğrafı kaydet'}).click()
 const avatar=page.getByAltText('Profil fotoğrafın');await expect(avatar).toBeVisible();const url=(await avatar.getAttribute('src'))!
 expect((await request.get(url)).status()).toBe(200);await page.getByRole('button',{name:'Fotoğrafı kaldır'}).click();await expect(avatar).toHaveCount(0);expect((await request.get(url)).status()).toBe(404)
 await page.goto('/manager/analytics');await expect(page.getByRole('img')).toHaveCount(4);await page.getByRole('button',{name:'Son 7 gün'}).click();await expect(page.getByText('7 gün · Europe/Istanbul')).toBeVisible()
 await page.screenshot({path:info.outputPath('manager-analytics.png'),fullPage:true})
 await page.goto('/manager/users?q='+encodeURIComponent(email));await expect(page.getByRole('link',{name:/Deniz Başvuru/})).toBeVisible()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await context.close()
})
