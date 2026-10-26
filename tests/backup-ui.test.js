import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as core from '../dist/core.js';
import * as storage from '../dist/storage.js';
import * as progress from '../dist/work-in-progress.js';
import {excerptSegments} from '../dist/review-format.js';

// Run actual app event handlers with deterministic storage and a minimal DOM.
// This checks state/focus contracts, not layout or full browser accessibility.
const source=(await readFile(new URL('../dist/app.js',import.meta.url),'utf8')).replace(/^import .*\n/gm,'');
const memory=()=>{const values=new Map();return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};
function app(raw=null,temporaryValues=[],hash='#data'){
 const learning=memory(),temporary=memory(),handlers={},windowHandlers={},downloads=[],blobs=[];
 if(raw!==null)learning.setItem(storage.STORAGE_KEY,raw);
 for(const [key,value] of temporaryValues)temporary.setItem(key,value);
 const document={activeElement:null};
 const element=()=>({textContent:'',innerHTML:'',dataset:{},attributes:{},classList:{toggle(){}},setAttribute(key,value){this.attributes[key]=value;},focus(){document.activeElement=this;},scrollIntoView(){},click(){downloads.push({name:this.download,url:this.href});}});
 const main=element(),notice=element(),file=element(),preview=element(),today=element();
 document.body={dataset:{}};document.documentElement={dataset:{}};
 document.querySelector=selector=>({'#main':main,'#notice':notice,'#today':today}[selector]||(selector==='#backup-file'&&main.innerHTML.includes('id="backup-file"')?file:null)||(selector==='.data-preview'&&main.innerHTML.includes('class="data-preview"')?preview:null));
 document.querySelectorAll=()=>[];document.createElement=()=>element();document.addEventListener=(type,fn)=>{handlers[type]=fn;};
 const sandbox={...core,...progress,excerptSegments,STORAGE_KEY:storage.STORAGE_KEY,RECOVERY_KEY:storage.RECOVERY_KEY,
  readWorkspace:()=>storage.readWorkspace(learning),saveWorkspace:(next,revision)=>storage.saveWorkspace(next,revision,learning),restoreWorkspace:(next,store,raw)=>storage.restoreWorkspace(next,store,raw),
  document,window:{addEventListener:(type,fn)=>{windowHandlers[type]=fn;}},location:{hash},localStorage:learning,sessionStorage:temporary,matchMedia:()=>({matches:false}),
  FormData:class {constructor(form){this.fields=form.fields;}[Symbol.iterator](){return Object.entries(this.fields)[Symbol.iterator]();}},
  URL:{createObjectURL:blob=>{blobs.push(blob);return 'blob:synthetic-'+blobs.length;},revokeObjectURL(){}},Blob,Intl,Date,TextEncoder,structuredClone,setTimeout:fn=>fn(),console};
 const context=vm.createContext(sandbox);vm.runInContext(source,context);
 const read=expression=>vm.runInContext(expression,context);
 const click=action=>handlers.click({target:{closest:()=>({dataset:{action}})},preventDefault(){}});
 const choose=async(content,size)=>{handlers.change({target:{id:'backup-file',files:[{size:size??new TextEncoder().encode(content).length,text:()=>Promise.resolve(content)}],closest:()=>null}});await new Promise(resolve=>setImmediate(resolve));};
 return {learning,temporary,main,notice,file,preview,document,read,click,choose,handlers,downloads,blobs,windowHandlers};
}

test('actual export/preview/cancel/commit/reload preserves snapshots and writes no preview data',async()=>{
 const current=core.demoWorkspace(),other=core.demoWorkspace();
 const replacement=core.recordAttempt(other,{cardId:other.cards[1].id,answer:'antonym'}),exporter=app(JSON.stringify(replacement));
 exporter.click('export');assert.equal(exporter.downloads[0].name,'sabaqloop-backup.json');
 const backup=await exporter.blobs[0].text();assert.deepEqual(core.parseBackup(backup),replacement);
 const ui=app(JSON.stringify(current)),before=[...ui.learning.values];
 await ui.choose(backup);assert.deepEqual([...ui.learning.values],before);assert.equal(ui.document.activeElement,ui.preview);
 ui.click('cancel-import');assert.equal(ui.read('pendingBackup'),null);assert.deepEqual([...ui.learning.values],before);assert.equal(ui.document.activeElement,ui.file);
 await ui.choose(backup);ui.click('import');assert.deepEqual(ui.read('state'),replacement);assert.equal(ui.document.activeElement,ui.main);
 assert.equal(ui.learning.getItem(storage.RECOVERY_KEY),before.find(([key])=>key===storage.STORAGE_KEY)[1]);
 const reloaded=app(ui.learning.getItem(storage.STORAGE_KEY));assert.deepEqual(reloaded.read('state'),replacement);
 assert.equal(reloaded.read('state.cards.length'),3);assert.equal(reloaded.read('state.attempts.length'),1);
});

test('recovery preview can be cancelled without replacing corrupt raw storage',async()=>{
 const ui=app('synthetic corrupt active copy'),backup=core.encodeBackup(core.demoWorkspace());
 await ui.choose(backup);
 assert.match(ui.main.innerHTML,/data-action="cancel-import"/);
 assert.equal(ui.document.activeElement,ui.preview);
 ui.click('cancel-import');assert.equal(ui.read('pendingBackup'),null);
 assert.equal(ui.learning.getItem(storage.STORAGE_KEY),'synthetic corrupt active copy');
 assert.equal(ui.document.activeElement,ui.file);
});

test('malformed, wrong-product and oversized files clear prior preview and focus an actionable error',async()=>{
 for(const [content,size] of [['{broken',undefined],[JSON.stringify({application:'Other product',workspace:core.demoWorkspace()}),undefined],['{}',5_000_001]]){
  const ui=app(core.encodeBackup(core.demoWorkspace()));await ui.choose(core.encodeBackup(core.demoWorkspace()));
  assert.ok(ui.read('pendingBackup'));const before=[...ui.learning.values];
  await ui.choose(content,size);assert.equal(ui.read('pendingBackup'),null);assert.deepEqual([...ui.learning.values],before);
  assert.equal(ui.document.activeElement,ui.notice);assert.ok(ui.notice.textContent);
 }
});

test('stale import confirmation and quota failure retain current data and focus errors',async()=>{
 const current=core.demoWorkspace(),ui=app(JSON.stringify(current));
 await ui.choose(core.encodeBackup(core.demoWorkspace()));
 const newer=core.recordAttempt(current,{cardId:current.cards[0].id,answer:'since'});
 ui.learning.setItem(storage.STORAGE_KEY,JSON.stringify(newer));const before=[...ui.learning.values];
 ui.click('import');assert.deepEqual([...ui.learning.values],before);assert.equal(ui.document.activeElement,ui.notice);assert.match(ui.notice.textContent,/другой вкладке/);
 const denied=app(JSON.stringify(current)),snapshot=[...denied.learning.values];denied.learning.setItem=()=>{throw Error('synthetic quota');};
 denied.click('demo');assert.deepEqual([...denied.learning.values],snapshot);assert.equal(denied.read('state.cards.length'),current.cards.length);assert.equal(denied.document.activeElement,denied.notice);assert.match(denied.notice.textContent,/Не удалось сохранить/);
});


test('empty corrupt raw data can be downloaded before restore and again from recovery',async()=>{
 const ui=app('');assert.match(ui.main.innerHTML,/Сохранённая копия требует внимания/);
 assert.doesNotMatch(ui.main.innerHTML,/data-action="export-raw"[^>]*disabled/);
 ui.click('export-raw');assert.equal(ui.downloads[0].name,'sabaqloop-original-recovery.json');assert.equal(await ui.blobs[0].text(),'');
 await ui.choose(core.encodeBackup(core.demoWorkspace()));ui.click('import');
 assert.equal(ui.learning.getItem(storage.RECOVERY_KEY),'');
 ui.click('recovery');assert.equal(ui.downloads.length,2);assert.equal(ui.downloads[1].name,'sabaqloop-previous-copy.json');assert.equal(await ui.blobs[1].text(),'');
});

test('a late earlier file read cannot replace a newer preview or undo cancellation',async()=>{
 const ui=app(JSON.stringify(core.demoWorkspace())),old=core.demoWorkspace(),latest=core.demoWorkspace();
 let resolveOld;const oldRead=new Promise(resolve=>{resolveOld=resolve;});
 ui.handlers.change({target:{id:'backup-file',files:[{size:100,text:()=>oldRead}],closest:()=>null}});
 await ui.choose(core.encodeBackup(latest));assert.equal(ui.read('pendingBackup.workspaceId'),latest.workspaceId);
 ui.click('cancel-import');resolveOld(core.encodeBackup(old));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(ui.read('pendingBackup'),null);assert.equal(ui.document.activeElement,ui.file);
});

test('reload resumes actual saved practice feedback and cannot record the same submitted answer twice',()=>{
 const state=core.demoWorkspace(),ui=app(JSON.stringify(state),[],'#practice');ui.click('start');
 const submit=instance=>instance.handlers.submit({target:{id:'answer-form',dataset:{},fields:{answer:'since'}},preventDefault(){}});
 submit(ui);assert.equal(ui.read('state.attempts.length'),1);assert.equal(ui.read('session.feedback.correct'),true);
 const reloaded=app(ui.learning.getItem(storage.STORAGE_KEY),[...ui.temporary.values],'#practice');
 assert.equal(reloaded.read('session.index'),0);assert.equal(reloaded.read('session.attemptIds.length'),1);
 assert.equal(reloaded.read('session.feedback.answer'),'since');assert.equal(reloaded.read('state.attempts.length'),1);
 submit(reloaded);assert.equal(reloaded.read('state.attempts.length'),1);
 reloaded.click('next');assert.equal(reloaded.read('session.index'),1);assert.equal(reloaded.read('session.feedback'),null);
});

test('saved teacher card survives draft-cleanup denial and reports the leftover draft without claiming a failed card save',()=>{
 const state=core.demoWorkspace(),ui=app(JSON.stringify(state),[],'#bank'),key=progress.teacherDraftKey(state.workspaceId,'card-form');
 const fields={deckId:state.decks[0].id,prompt:'Synthetic QA question?',type:'short',answer:'proof',options:'',aliases:'',explanation:'Synthetic teacher explanation.',sourceTitle:'Synthetic teacher source',sourceUrl:'',excerpt:'This synthetic source contains proof.'};
 progress.writeFormDraft(ui.temporary,key,fields);
 ui.temporary.removeItem=()=>{throw Error('synthetic cleanup blocked');};ui.temporary.setItem=()=>{throw Error('synthetic cleanup blocked');};
 ui.handlers.submit({target:{id:'card-form',dataset:{draftKey:key},fields},preventDefault(){}});
 assert.equal(ui.read('state.cards.length'),4);assert.equal(storage.readWorkspace(ui.learning).state.cards.length,4);
 assert.match(ui.notice.textContent,/Запись сохранена.*черновик.*не удалось удалить/);
 assert.equal(ui.document.activeElement,ui.notice);
});
