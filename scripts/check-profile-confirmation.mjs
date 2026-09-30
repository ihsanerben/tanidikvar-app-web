import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync(new URL('../src/components/profile-form.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
for(const scenario of [
 {name:'university change cancelled',role:'TANIDIK',university:'new',confirm:false,writes:0,prompts:1},
 {name:'university change approved',role:'TANIDIK',university:'new',confirm:true,writes:1,prompts:1},
 {name:'candidate transition requires confirmation',role:'TANIDIK',university:'old',education:'YKS_ADAYI',confirm:false,writes:0,prompts:1},
 {name:'same university graduation saves directly',role:'TANIDIK',university:'old',education:'MEZUN',writes:1,prompts:0},
 {name:'ordinary members save directly',role:'MEMBER',university:'new',writes:1,prompts:0},
])test(scenario.name,async()=>{
 const profile={programId:'program',education:{universityId:'old',departmentId:'department',departmentName:'Bilgisayar Mühendisliği'},version:1},states=[false,profile,[],[],scenario.university,'program',scenario.education??'UNIVERSITE_OGRENCISI',''];
 let index=0,prompts=0;const writes=[],destinations=[];
 const load=name=>name==='react'?{useState:()=>[states[index++],()=>{}],useRef:value=>({current:value}),useEffect:()=>{}}:name==='react/jsx-runtime'?{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})}:name==='@/lib/client-api'?{apiRequest:async(path,options)=>{if(path==='/me')return{role:scenario.role};writes.push(JSON.parse(options.body));return profile;}}:name==='@/lib/dialogs'?{confirmDialog:async()=>{prompts++;return scenario.confirm;}}:{};
 const exports={};class FormData{constructor(values){this.values=values;}get(key){return this.values[key]??null;}}
 new Function('exports','require','FormData','window',compiled)(exports,load,FormData,{location:{replace:path=>destinations.push(path)}});
 const form=exports.ProfileForm();await form.props.onSubmit({preventDefault(){},currentTarget:{educationStatus:scenario.education??'UNIVERSITE_OGRENCISI',firstName:'Ayşe',lastName:'Yılmaz',programId:'program',graduationYear:'2025'}});
 assert.equal(prompts,scenario.prompts);assert.equal(writes.length,scenario.writes);assert.deepEqual(destinations,scenario.writes ? ['/hesabim'] : []);
 if(scenario.writes&&scenario.education!=='YKS_ADAYI')assert.equal(writes[0].programId,'program');
});

test('legacy department remains in an unrelated profile edit',async()=>{
 const profile={programId:null,education:{universityId:'old',departmentId:'department',departmentName:'Bilgisayar Mühendisliği'},version:1};
 const states=[false,profile,[],[],'old','','MEZUN',''];let index=0,payload;
 const load=name=>name==='react'?{useState:()=>[states[index++],()=>{}],useRef:value=>({current:value}),useEffect:()=>{}}:name==='react/jsx-runtime'?{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})}:name==='@/lib/client-api'?{apiRequest:async(_path,options)=>{payload=JSON.parse(options.body);return profile;}}:name==='@/lib/dialogs'?{confirmDialog:async()=>true}:{};
 const exports={};class FormData{constructor(values){this.values=values;}get(key){return this.values[key]??null;}}
 new Function('exports','require','FormData','window',compiled)(exports,load,FormData,{location:{replace(){}}});
 const form=exports.ProfileForm();await form.props.onSubmit({preventDefault(){},currentTarget:{educationStatus:'MEZUN',firstName:'Ayşe',lastName:'Yılmaz',graduationYear:'2025'}});
 assert.equal(payload.programId,null);assert.equal(payload.departmentId,'department');
});
