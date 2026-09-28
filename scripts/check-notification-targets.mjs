import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
import { createRequire } from 'node:module';

const source = readFileSync(new URL('../src/lib/notification-destination.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const destination = exports.notificationDestination;
const question = '11111111-1111-4111-8111-111111111111';
const answer = '22222222-2222-4222-8222-222222222222';
const comment = '33333333-3333-4333-8333-333333333333';
const urls = {};
new Function('exports', ts.transpileModule(readFileSync(new URL('../src/lib/public-url.ts', import.meta.url), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(urls);

test('answers and nested replies retain their exact identities', () => {
  assert.equal(destination({targetType:'ANSWER',targetId:answer,questionId:question,answerId:answer}), `/soru/${question}?yanit=${answer}#answer-${answer}`);
  assert.equal(destination({targetType:'ANSWER_COMMENT',targetId:comment,questionId:question,answerId:answer}), `/soru/${question}?yanit=${answer}&yorum=${comment}#comment-${comment}`);
});

test('activity notifications open the matching panel and content', () => {
  assert.equal(destination({targetType:'POLL',targetId:comment,universityId:question}), `/universite/${question}?sekme=anketler&icerik=${comment}#content-${comment}`);
  assert.equal(destination({targetType:'METRIC',targetId:comment,universityId:question,metricKey:'WEEKLY_STUDY_HOURS'}), `/universite/${question}?sekme=olcumler&olcum=WEEKLY_STUDY_HOURS#metric-WEEKLY_STUDY_HOURS`);
  assert.equal(destination({type:'ACHIEVEMENT'}), '/hesabim/rozetler');
});

test('UUID notification links are accepted by page resolvers; invalid links remain rejected', () => {
  assert.equal(urls.questionIdFromSegment(question), question);
  assert.equal(urls.catalogIdFromSegment(question), question);
  assert.equal(urls.questionIdFromSegment(urls.questionSegment('Örnek soru',question)), question);
  assert.equal(urls.catalogIdFromSegment(urls.catalogSegment('Üniversite',question)), question);
  assert.equal(urls.questionIdFromSegment(`invalid${question}`), null);
  assert.equal(urls.catalogIdFromSegment('invalid'), null);
});

test('question page canonical redirect retains the exact reply and fragment', async () => {
  const require = createRequire(import.meta.url), page = {}, redirects = [];
  const load = name => {
    if (name === 'next/navigation') return {notFound(){throw new Error('Unexpected 404');},permanentRedirect(url){redirects.push(url);throw new Error('redirect');}};
    if (name === '@/lib/public-url') return urls;
    if (name === '@/lib/api/questions') return {getQuestion:async()=>({id:question,title:'Örnek soru'})};
    if (name === '@/lib/api/answers') return {getQuestionAnswers:async()=>[]};
    if (name === '@/lib/session') return {currentUser:async()=>null};
    if (name.startsWith('@/')) return {};
    return require(name);
  };
  const compiledPage=ts.transpileModule(readFileSync(new URL('../src/app/soru/[questionSlug]/page.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  new Function('require','exports',compiledPage)(load,page);
  await assert.rejects(page.default({params:Promise.resolve({questionSlug:question}),searchParams:Promise.resolve({yanit:answer,yorum:comment})}),/redirect/);
  assert.equal(redirects[0],`/soru/${urls.questionSegment('Örnek soru',question)}?yanit=${answer}&yorum=${comment}#comment-${comment}`);
  await assert.rejects(page.default({params:Promise.resolve({questionSlug:question}),searchParams:Promise.resolve({})}),/redirect/);
  assert.equal(redirects[1],`/soru/${urls.questionSegment('Örnek soru',question)}`);
});
