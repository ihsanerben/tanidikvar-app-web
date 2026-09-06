import { expect,test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { account,promoteTestManager } from './accounts'

test('candidate profile can be completed, edited and reopened',async({page,request},testInfo)=>{
  await account(page,request)
  await page.getByRole('link',{name:'Profilini tamamla',exact:true}).click()
  await page.getByLabel('Ad',{exact:true}).fill('Deniz');await page.getByLabel('Soyad',{exact:true}).fill('Yılmaz')
  await page.getByRole('button',{name:'Profili kaydet'}).click()
  await expect(page.getByText('Profilin kaydedildi.')).toBeVisible()
  await page.reload();await expect(page.getByLabel('Ad',{exact:true})).toHaveValue('Deniz')
  await expect(page.locator('.header-identity')).toContainText('Deniz Yılmaz')
  await expect(page.locator('.header-identity')).toContainText('YKS Adayı')
  await page.getByLabel('Kısa biyografi').fill('Tercih dönemine hazırlanıyorum.')
  await page.getByRole('button',{name:'Profili kaydet'}).click();await expect(page.getByText('Profilin kaydedildi.')).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('profile.png'),fullPage:true})
  await page.goto('/account');await expect(page.locator('.account-summary')).toContainText('Deniz Yılmaz')
  await page.getByRole('link',{name:'Hesap durumu',exact:true}).click();await expect(page.getByText('Tamamlandı',{exact:true})).toHaveCount(2)
  await page.goto('/manager');await expect(page.getByRole('heading',{name:'Bu sayfaya erişim iznin yok.'})).toBeVisible()
})

test('manager identity and catalog linking stay independent from education',async({page,request},testInfo)=>{
  const email=await account(page,request);promoteTestManager(email);await page.goto('/manager')
  await expect(page.getByRole('heading',{name:'Platforma genel bakış'})).toBeVisible()
  if(testInfo.project.name==='mobile'){await page.getByRole('button',{name:'Menü',exact:true}).click();await expect(page.getByRole('navigation',{name:'Yönetim menüsü'})).toBeVisible();await page.getByRole('link',{name:'Hesabım',exact:true}).click();await expect(page.getByRole('button',{name:'Menü',exact:true})).toHaveAttribute('aria-expanded','false')}else await page.getByRole('link',{name:'Hesabım',exact:true}).click()
  await page.getByLabel('Ad',{exact:true}).fill('Deniz');await page.getByLabel('Soyad',{exact:true}).fill('Yönetici');await page.getByRole('button',{name:'Bilgilerimi kaydet'}).click();await expect(page.getByText('Bilgilerin kaydedildi.')).toBeVisible()
  await expect(page.getByLabel('Eğitim durumu')).toHaveCount(0);await expect(page.getByRole('link',{name:'Sorularım',exact:true})).toHaveCount(0)
  await page.reload();await expect(page.getByLabel('Ad',{exact:true})).toHaveValue('Deniz')
  await page.goto('/manager/catalog?tab=UNIVERSITY')
  const suffix=randomUUID().slice(0,8),university=`Test Üniversitesi ${suffix}`,department=`Test Bölümü ${suffix}`,tag=`Konu ${suffix}`
  async function add(name:string){await page.getByLabel('Yeni kayıt adı').fill(name);await page.getByLabel('Ekleme gerekçesi').fill('Yerel katalog incelemesi');await page.getByRole('button',{name:'Ekle',exact:true}).click();await expect(page.getByText('Kayıt eklendi.',{exact:true})).toBeVisible()}
  await add(university);await page.getByRole('button',{name:'Bölümler',exact:true}).click();await expect(page.getByRole('button',{name:'Bölümler',exact:true})).toHaveAttribute('aria-current','page');await add(department)
  await page.getByRole('button',{name:'Üniversite–bölüm eşleşmeleri'}).click();await page.getByLabel('Üniversite',{exact:true}).selectOption({label:university});await page.getByLabel('Eklenecek bölüm',{exact:true}).selectOption({label:department});await page.getByLabel('Eşleştirme gerekçesi').fill('Üniversitede bölüm var');await page.getByRole('button',{name:'Üniversiteye bölüm ekle'}).click();await expect(page.getByText('Eşleşme kaydedildi.')).toBeVisible()
  await page.goto('/manager/tags');await add(tag)
  await page.locator('.catalog-list li').filter({hasText:tag}).getByRole('button',{name:'Pasife al',exact:true}).click();await expect(page.getByText('0 bağlı profil · 0 bağlı soru')).toBeVisible();await page.getByRole('button',{name:'Kaydı pasifleştir',exact:true}).click();await page.getByLabel('İşlem gerekçesi').fill(`Tag incelemeye alındı ${suffix}`);await page.getByRole('button',{name:'Kaydı pasifleştir — onayla'}).click();await expect(page.locator('.catalog-list li').filter({hasText:tag})).toHaveCount(0)
  await page.getByLabel('Pasif kayıtları göster').check();await page.locator('.catalog-list li').filter({hasText:tag}).getByRole('button',{name:'Geri yükle',exact:true}).click();await page.getByRole('button',{name:'Kaydı geri aç',exact:true}).click();await page.getByLabel('İşlem gerekçesi').fill('İnceleme tamamlandı');await page.getByRole('button',{name:'Kaydı geri aç — onayla'}).click();await expect(page.locator('.catalog-list li').filter({hasText:tag}).getByText('Aktif',{exact:true})).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('manager-catalog.png'),fullPage:true})
  await page.goto('/manager/actions');await page.getByLabel('İşlem, kişi veya gerekçede ara').fill(`Tag incelemeye alındı ${suffix}`);await page.getByRole('button',{name:'Filtrele'}).click();await expect(page.getByRole('link',{name:'Katalog pasifleştirildi',exact:true})).toHaveCount(1);await page.getByRole('link',{name:'Katalog pasifleştirildi',exact:true}).click();await expect(page.getByText('Deniz Yönetici',{exact:true})).toBeVisible();await expect(page.getByText(`Tag incelemeye alındı ${suffix}`,{exact:true})).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('manager-action-detail.png'),fullPage:true})
})
