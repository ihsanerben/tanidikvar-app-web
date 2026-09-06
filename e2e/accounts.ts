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
  execFileSync('docker',['exec','-i',process.env.E2E_POSTGRES_CONTAINER??'tanidikvar-postgres-1','psql',
    '-U',process.env.E2E_DB_USER??'tanidikvar','-d',process.env.E2E_DB_NAME??'tanidikvar','-v','ON_ERROR_STOP=1'],
    {input:`UPDATE users SET authority='MANAGER',version=version+1,updated_at=CURRENT_TIMESTAMP WHERE email='${email}' AND email_verified_at IS NOT NULL AND deleted_at IS NULL;`,stdio:['pipe','pipe','pipe']})
}

