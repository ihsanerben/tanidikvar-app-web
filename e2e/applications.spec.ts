import { expect,test, type APIRequestContext } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { account,promoteTestManager } from './accounts'
async function create(request:APIRequestContext,path:string,body:unknown){const csrf=await (await request.get('/api/auth/csrf')).json();const r=await request.post(path,{data:body,headers:{'X-XSRF-TOKEN':csrf.token}});expect(r.status()).toBe(201);return r.json()}
test('private application review, reverification, revocation and avatar lifecycle',async({page,request,browser},testInfo)=>{
 const email=await account(page,request);promoteTestManager(email);await page.reload()
 const suffix=randomUUID().slice(0,8)
 const u=await create(page.request,'/api/manager/catalog/UNIVERSITY',{name:'Başvuru Üniversitesi '+suffix})
 const d=await create(page.request,'/api/manager/catalog/DEPARTMENT',{name:'Başvuru Bölümü '+suffix})
 await create(page.request,'/api/manager/university-departments',{universityId:u.id,departmentId:d.id})
 const context=await browser.newContext({baseURL:testInfo.project.use.baseURL,viewport:testInfo.project.use.viewport})
 const student=await context.newPage()
 try{
  await account(student,request);await student.goto('/profile')
  await student.getByLabel('Ad',{exact:true}).fill('Ada');await student.getByLabel('Soyad',{exact:true}).fill('Başvuru '+suffix)
  await student.getByLabel('Eğitim durumu').selectOption('UNIVERSITE_OGRENCISI')
  await student.getByLabel('Üniversite ara',{exact:true}).fill(suffix)
  await student.getByLabel('Üniversite',{exact:true}).selectOption({label:u.name})
  await student.getByLabel('Bölüm',{exact:true}).selectOption({label:d.name})
  await student.getByRole('button',{name:'Profili kaydet'}).click();await expect(student.getByText('Profilin kaydedildi.')).toBeVisible()
  await student.reload()
  const png=await student.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;const g=c.getContext('2d')!;g.fillStyle='#00805a';g.fillRect(0,0,20,20);return c.toDataURL('image/png').split(',')[1]})
  await student.getByLabel('Fotoğraf seç').setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')})
  await student.getByRole('button',{name:'Fotoğrafı kaydet'}).click();await expect(student.getByText('Fotoğraf güncellendi.')).toBeVisible()
  const avatar=student.getByAltText('Profil fotoğrafın');await expect(avatar).toBeVisible();const avatarUrl=(await avatar.getAttribute('src'))!
  expect((await request.get(avatarUrl)).status()).toBe(200)
  await student.getByRole('button',{name:'Fotoğrafı kaldır'}).click();await expect(avatar).toHaveCount(0)
  expect((await request.get(avatarUrl)).status()).toBe(404)
  await student.goto('/applications')
  const file={name:'belge.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n')}
  async function submit(){await student.getByLabel('e-Devlet öğrenci / mezun belgesi').setInputFiles(file);await student.getByRole('button',{name:'Başvuruyu gönder'}).click();await expect(student.getByText('Başvurun alındı. Manager incelemesini burada takip edebilirsin.')).toBeVisible();await expect(student.getByText('İnceleme bekliyor',{exact:true})).toBeVisible()}
  await submit()
  const first=(await (await student.request.get('/api/me/admin-applications')).json()).items[0]
  expect((await request.get('/api/files/'+first.documentFileId+'/download')).status()).toBe(401)
  const download=student.waitForEvent('download');await student.getByRole('button',{name:'Belgeyi indir'}).click();expect((await download).suggestedFilename()).toBe('belge.pdf')
  await page.goto('/manager/applications')
  let card=page.getByRole('article').filter({hasText:'Başvuru '+suffix})
  await expect(card).toBeVisible();await card.getByRole('button',{name:'Reddet',exact:true}).click()
  await card.getByLabel('Gerekçe').fill('Belgeyi daha okunaklı yükle.')
  await card.getByRole('button',{name:'Kararı onayla'}).click();await expect(card).toHaveCount(0)
  await student.reload();await expect(student.getByText('Ret gerekçesi: Belgeyi daha okunaklı yükle.')).toBeVisible()
  await submit()
  await page.reload();card=page.getByRole('article').filter({hasText:'Başvuru '+suffix})
  await card.getByRole('button',{name:'Kabul et',exact:true}).click()
  await card.getByRole('button',{name:'Kararı onayla'}).click();await expect(card).toHaveCount(0)
  await student.reload();await expect(student.getByText('Güncel doğrulama',{exact:true})).toBeVisible()
  expect((await (await student.request.get('/api/me')).json()).role).toBe('ADMIN')
  await submit()
  await page.getByLabel('Başvuru durumu').selectOption('APPROVED');card=page.getByRole('article').filter({hasText:'Başvuru '+suffix})
  await card.getByRole('button',{name:'Admin yetkisini kaldır'}).click();await card.getByLabel('Gerekçe').fill('Doğrulama yeniden yapılmalı.')
  await card.getByRole('button',{name:'Kararı onayla'}).click();await expect(card.getByText('Geçmiş onay — güncel Admin yetkisini göstermez.')).toBeVisible()
  await student.reload();await expect(student.getByText(/Admin yetkisi kaldırıldığı için kapatıldı/)).toBeVisible()
  expect((await (await student.request.get('/api/me')).json()).role).toBe('UNIVERSITE_OGRENCISI')
  expect(await student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await student.screenshot({path:testInfo.outputPath('applications.png'),fullPage:true})
  await page.screenshot({path:testInfo.outputPath('manager-applications.png'),fullPage:true})
 }finally{await context.close()}
})

