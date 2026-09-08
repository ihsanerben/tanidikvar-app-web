import type { Page,APIRequestContext } from '@playwright/test'
import { expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mailLink } from './mailbox'

export async function account(page:Page,request:APIRequestContext){
  const email=`browser-profile-${randomUUID()}@example.test`
  await page.goto('/register')
  await page.getByLabel('E-posta adresi').fill(email);await page.getByLabel('Şifre',{exact:true}).fill('Browser-profile-password!')
  await page.getByRole('button',{name:'Hesap oluştur'}).click();await expect(page.getByRole('heading',{name:'E-postanı kontrol et.'})).toBeVisible()
  await page.goto(await mailLink(request,email,'verify-email'));await page.getByRole('button',{name:'E-postamı doğrula'}).click()
  await expect(page.getByRole('heading',{name:'E-postan doğrulandı.'})).toBeVisible()
  await page.goto('/login');await page.getByLabel('E-posta adresi').fill(email);await page.getByLabel('Şifre',{exact:true}).fill('Browser-profile-password!')
  await page.getByRole('button',{name:'Giriş yap'}).click();await expect(page.getByRole('heading',{name:'Hesabım'})).toBeVisible()
  return email
}
export function promoteTestManager(email:string){
  if(!/^browser-profile-[0-9a-f-]+@example\.test$/.test(email))throw new Error('Only synthetic browser profile accounts can be promoted')
  if(!process.env.E2E_POSTGRES_CONTAINER||!process.env.E2E_DB_USER||!process.env.E2E_DB_NAME)throw new Error('Set the isolated E2E database environment before promoting synthetic accounts')
  execFileSync('docker',['exec','-i',process.env.E2E_POSTGRES_CONTAINER??'tanidikvar-postgres-1','psql',
    '-U',process.env.E2E_DB_USER??'tanidikvar','-d',process.env.E2E_DB_NAME??'tanidikvar','-v','ON_ERROR_STOP=1'],
    {input:`UPDATE users SET authority='MANAGER',version=version+1,updated_at=CURRENT_TIMESTAMP WHERE email='${email}' AND email_verified_at IS NOT NULL AND deleted_at IS NULL;`,stdio:['pipe','pipe','pipe']})
}

export async function uploadPhoto(page:Page){
  await page.getByRole('button',{name:'Profil fotoğrafını düzenle'}).click()
  const dialog=page.getByRole('dialog')
  const png=await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=40;canvas.height=40;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#367c62';ctx.fillRect(0,0,40,40);return canvas.toDataURL('image/png').split(',')[1]})
  await dialog.getByLabel('Fotoğraf seç').setInputFiles({name:'test-avatar.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')})
  await dialog.getByRole('button',{name:'Fotoğrafı kaydet'}).click()
  await expect(dialog.getByText('Fotoğraf güncellendi.')).toBeVisible()
  await dialog.getByRole('button',{name:'Kapat',exact:true}).click()
  await expect(dialog).toHaveCount(0)
}

export async function completeProfile(page:Page,status='YKS_ADAYI',lastName='İnceleme'){
  await page.goto('/profile')
  await page.getByLabel('Ad',{exact:true}).fill('Deniz');await page.getByLabel('Soyad',{exact:true}).fill(lastName)
  await page.getByLabel('Eğitim durumu').selectOption(status)
  if(status!=='YKS_ADAYI'){
    await page.getByLabel('Üniversite',{exact:true}).selectOption({label:'Dokuz Eylül Üniversitesi'})
    await page.getByLabel('Bölüm',{exact:true}).selectOption({label:'Bilgisayar Mühendisliği'})
    if(status==='MEZUN')await page.getByLabel('Mezuniyet yılı').fill('2024')
  }
  await uploadPhoto(page)
  await page.getByRole('button',{name:'Profili kaydet'}).click()
  await expect(page).toHaveURL(/\/account$/)
}

export async function mutation(request:APIRequestContext,path:string,data:unknown,method:'post'|'put'='post'){
  const {token}=await (await request.get('/api/auth/csrf')).json()
  const response=await request[method](path,{data,headers:{'X-XSRF-TOKEN':token}})
  expect(response.ok(),`${method} ${path}: ${response.status()}`).toBe(true)
  return response.status()===204?null:response.json()
}
