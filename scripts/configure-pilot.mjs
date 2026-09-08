import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export function pilotConfig(current, origin) {
  let url
  try { url = new URL(origin) } catch { throw new Error('Geçerli Render HTTPS origin adresini belirt.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || url.port || !url.hostname.endsWith('.onrender.com')) {
    throw new Error('Yalnız https://servis-adi.onrender.com biçimindeki Render origin adresi kabul edilir.')
  }
  return { ...current, rewrites: [
    { source: '/api/:path*', destination: `${url.origin}/api/:path*` },
    ...(current.rewrites ?? []).filter(rule => rule.source !== '/api/:path*'),
  ], headers: [
    ...(current.headers ?? []).filter(rule => rule.source !== '/api/:path*'),
    { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }, { key: 'CDN-Cache-Control', value: 'no-store' }, { key: 'Vercel-CDN-Cache-Control', value: 'no-store' }] },
  ] }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const path = new URL('../vercel.json', import.meta.url)
    const current = JSON.parse(await readFile(path, 'utf8'))
    await writeFile(path, JSON.stringify(pilotConfig(current, process.argv[2]), null, 2) + '\n')
    console.log('vercel.json pilot proxy için hazırlandı. Commit veya deploy yapılmadı.')
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
