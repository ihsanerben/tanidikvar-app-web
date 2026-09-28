import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/app/karsilastir/page.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
async function render(failing = false) {
  const exports = {};
  const requests = [];
  const catalog = {
    getUniversity: async id => ({ id, name: `Üniversite ${id}` }),
    getUniversityCatalogStatistics: async id => {
      requests.push(id);
      if (failing && id === 'second') throw new Error('unavailable');
      return { programCount: 9, facultyCount: 2, optionCount: 12, yearly: [{ year: 2024, quota: 123, placed: 0, fillRate: 0 }, { year: 2025, quota: 999, placed: 999, fillRate: 100 }] };
    },
  };
  const load = name => name === '@/components/compare-form' ? { CompareForm: () => null } : name === '@/lib/api/catalog' ? catalog : require(name);
  new Function('require', 'exports', compiled)(load, exports);
  const tree = await exports.default({ searchParams: Promise.resolve({ mode: 'UNIVERSITY', year: '2024', u1: 'first', u2: 'second' }) });
  return { html: renderToStaticMarkup(tree), requests };
}
test('university comparison renders both columns and the requested year, including real zeroes', async () => {
  const { html, requests } = await render();
  assert.deepEqual(requests, ['first', 'second']);
  assert.match(html, /Üniversite karşılaştırması/);
  assert.match(html, /2024 karşılaştırması/);
  assert.match(html, /<td>123<\/td>/);
  assert.match(html, /<td>0<\/td>/);
  assert.doesNotMatch(html, /<td>999<\/td>/);
});
test('a failed university preserves the other column and exposes missing data and retry guidance', async () => {
  const { html } = await render(true);
  assert.match(html, /<td>123<\/td>/);
  assert.match(html, /Veri yok/);
  assert.match(html, /role="alert"/);
});
