import test from 'node:test';
import assert from 'node:assert/strict';
import {demoWorkspace,addDeck,encodeBackup,parseBackup} from '../dist/core.js';
import {readWorkspace,saveWorkspace,restoreWorkspace,STORAGE_KEY,RECOVERY_KEY} from '../dist/storage.js';

const memory=()=>{const values=new Map();return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};

test('an existing empty storage value is corrupt data, never a fresh writable workspace',()=>{
 const store=memory();store.setItem(STORAGE_KEY,'');store.setItem(RECOVERY_KEY,'previous synthetic copy');
 const before=[...store.values],loaded=readWorkspace(store);
 assert.equal(loaded.state,null);assert.equal(loaded.raw,'');assert.match(loaded.error,/данные не сброшены/);
 assert.throws(()=>saveWorkspace(demoWorkspace(),0,store),/JSON/);
 assert.deepEqual([...store.values],before);
});

test('explicit backup envelopes reject another product; raw version-1 workspaces remain importable',()=>{
 const state=demoWorkspace();
 assert.throws(()=>parseBackup(JSON.stringify({application:'Other product',workspace:state})),/SabaqLoop/);
 assert.throws(()=>parseBackup(JSON.stringify({workspace:state})),/SabaqLoop/);
 assert.deepEqual(parseBackup(JSON.stringify(state)),state);
 assert.deepEqual(parseBackup(encodeBackup(state)),state);
 for(const value of ['null','false','[]','{}','{"application":"Other product"}'])assert.throws(()=>parseBackup(value),/SabaqLoop/);
});

test('quota refusal never advances the learning state or consumes recovery',()=>{
 const store=memory(),state=demoWorkspace();restoreWorkspace(state,store);store.setItem(RECOVERY_KEY,'previous synthetic copy');
 const next=addDeck(state,{title:'Synthetic unsaved deck'}),before=[...store.values];
 store.setItem=()=>{throw Error('synthetic quota')};
 assert.throws(()=>saveWorkspace(next,state.revision,store),/Не удалось сохранить данные/);
 assert.deepEqual([...store.values],before);assert.deepEqual(readWorkspace(store).state,state);
});
