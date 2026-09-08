import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pilotConfig } from './configure-pilot.mjs'
test('API prefix survives the proxy and API caching stays disabled', () => {
 const original={rewrites:[{source:'/(.*)',destination:'/index.html'}]}
 const result=pilotConfig(original,'https://pilot-example.onrender.com')
 assert.equal(result.rewrites[0].destination,'https://pilot-example.onrender.com/api/:path*')
 assert.deepEqual(result.rewrites[1],original.rewrites[0])
 assert.equal(result.headers[0].headers[0].value,'private, no-store')
 assert.deepEqual(pilotConfig(result,'https://pilot-example.onrender.com'),result)
})
test('invalid or credential-bearing destinations are rejected',()=>{
 for(const url of [undefined,'http://pilot.onrender.com','https://user:pass@pilot.onrender.com','https://pilot.onrender.com/api','https://pilot.onrender.com?token=value','https://example.com'])assert.throws(()=>pilotConfig({},url))
})
