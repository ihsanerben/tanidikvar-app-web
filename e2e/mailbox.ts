import { expect, type APIRequestContext } from '@playwright/test'

const mailbox = process.env.E2E_MAILPIT_URL || 'http://localhost:8025'
export async function mailLink(request: APIRequestContext, email: string, path: string) {
  let link = ''
  await expect.poll(async () => {
    const response = await request.get(`${mailbox}/api/v1/search`, { params: { query: `to:${email}` } })
    const data = await response.json()
    for (const message of data.messages ?? []) {
      const detail = await (await request.get(`${mailbox}/api/v1/message/${message.ID}`)).json()
      const found = (detail.Text as string).match(new RegExp(`https?://[^\\s]+/${path}#token=[A-Za-z0-9_-]+`))
      if (found) { link = found[0]; return true }
    }
    return false
  }, { timeout: 10_000, message: 'Expected email link to arrive in the local test mailbox' }).toBe(true)
  return link
}

