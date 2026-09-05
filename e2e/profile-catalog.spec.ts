import { expect,test,type Page,type APIRequestContext } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mailLink } from './mailbox'

async function account(page:Page,request:APIRequestContext){
  const email=`browser-profile-${randomUUID()}@example.test`
  await page.goto('/register')
  await page.getByLabel('E-posta adresi').fill(email);await page.getByLabel('Şifre',{exact:true}).fill('Browser-profile-password!')
  await page.getByRole('button',{name:'Hesap oluştur'}).click();await expect(page.getByRole('heading',{name:'E-postanı kontrol et.'})).toBeVisible()
  await page.goto(await mailLink(request,email,'verify-email'));await page.getByRole('button',{name:'E-postamı doğrula'}).click()
  await expect(page.getByRole('heading',{name:'E-postan doğrulandı.'})).toBeVisible()
  await page.goto('/login');await page.getByLabel('E-posta adresi').fill(email);await page.getByLabel('Şifre',{exact:true}).fill('Browser-profile-password!')
  await page.getByRole('button',{name:'Giriş yap'}).click();await expect(page.getByRole('heading',{name:'İyi ki geldin.'})).toBeVisible()
  return email
}
function promoteTestManager(email:string){
  if(!/^browser-profile-[0-9a-f-]+@example\.test$/.test(email))throw new Error('Only synthetic browser profile accounts can be promoted')
  execFileSync('docker',['exec','-i',process.env.E2E_POSTGRES_CONTAINER??'tanidikvar-postgres-1','psql',
    '-U',process.env.E2E_DB_USER??'tanidikvar','-d',process.env.E2E_DB_NAME??'tanidikvar','-v','ON_ERROR_STOP=1'],
    {input:`UPDATE users SET authority='MANAGER',version=version+1,updated_at=CURRENT_TIMESTAMP WHERE email='${email}' AND email_verified_at IS NOT NULL AND deleted_at IS NULL;`,stdio:['pipe','pipe','pipe']})
}

test('candidate profile can be completed, edited and reopened',async({page,request},testInfo)=>{
  await account(page,request)
  await page.getByRole('link',{name:'Profilini tamamla',exact:true}).click()
  await page.getByLabel('Ad',{exact:true}).fill('Deniz');await page.getByLabel('Soyad',{exact:true}).fill('Yılmaz')
  await page.getByRole('button',{name:'Profili kaydet'}).click()
  await expect(page.getByText('Profilin kaydedildi.')).toBeVisible()
  await page.reload();await expect(page.getByLabel('Ad',{exact:true})).toHaveValue('Deniz')
  await page.getByLabel('Kısa biyografi').fill('Tercih dönemine hazırlanıyorum.')
  await page.getByRole('button',{name:'Profili kaydet'}).click();await expect(page.getByText('Profilin kaydedildi.')).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('profile.png'),fullPage:true})
  await page.goto('/manager');await expect(page.getByRole('heading',{name:'Bu sayfaya erişim iznin yok.'})).toBeVisible()
})

test('manager catalog supports linking, graduate profiles, soft delete and restore',async({page,request},testInfo)=>{
  const email=await account(page,request);promoteTestManager(email);await page.reload()
  await page.getByRole('link',{name:'Manager Panel'}).click()
  const suffix=randomUUID().slice(0,8)
  const university=`Test Üniversitesi ${suffix}`;const department=`Test Bölümü ${suffix}`;const tag=`Konu ${suffix}`
  await page.getByLabel('Yeni kayıt adı').fill(university);await page.getByRole('button',{name:'Ekle',exact:true}).click()
  await expect(page.getByText('Kayıt eklendi.',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Bölümler',exact:true}).click()
  await expect(page.getByRole('button',{name:'Bölümler',exact:true})).toHaveAttribute('aria-current','page')
  await page.getByLabel('Yeni kayıt adı').fill(department)
  await page.getByRole('button',{name:'Ekle',exact:true}).click();await expect(page.getByText('Kayıt eklendi.',{exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Üniversite–bölüm eşleşmeleri'}).click()
  await page.getByLabel('Üniversite ara',{exact:true}).fill(suffix)
  await page.getByLabel('Üniversite',{exact:true}).selectOption({label:university})
  await page.getByLabel('Eklenecek bölüm ara').fill(suffix)
  await page.getByLabel('Eklenecek bölüm',{exact:true}).selectOption({label:department})
  await page.getByRole('button',{name:'Üniversiteye bölüm ekle'}).click();await expect(page.getByText('Eşleşme kaydedildi.')).toBeVisible()
  await page.goto('/profile');await page.getByLabel('Ad',{exact:true}).fill('Ece');await page.getByLabel('Soyad',{exact:true}).fill('Demir')
  await page.getByLabel('Eğitim durumu').selectOption('MEZUN')
  await page.getByLabel('Üniversite ara',{exact:true}).fill(suffix);await page.getByLabel('Üniversite',{exact:true}).selectOption({label:university})
  await page.getByLabel('Bölüm',{exact:true}).selectOption({label:department});await page.getByLabel('Mezuniyet yılı').fill('2025')
  await page.getByRole('button',{name:'Profili kaydet'}).click();await expect(page.getByText('Profilin kaydedildi.')).toBeVisible()
  await page.reload();await expect(page.getByLabel('Mezuniyet yılı')).toHaveValue('2025')
  await page.goto('/manager?tab=TAG');await page.getByLabel('Yeni kayıt adı').fill(tag);await page.getByRole('button',{name:'Ekle',exact:true}).click()
  await expect(page.getByText('Kayıt eklendi.',{exact:true})).toBeVisible();await page.getByLabel('Listede ara').fill(suffix)
  await page.getByRole('button',{name:'Pasife al',exact:true}).click();await expect(page.getByText('Kayıt pasife alındı.')).toBeVisible()
  await page.getByLabel('Pasif kayıtları göster').check();await page.getByRole('button',{name:'Geri yükle',exact:true}).click()
  await expect(page.getByText('Kayıt geri yüklendi.')).toBeVisible()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath('manager.png'),fullPage:true})
})
