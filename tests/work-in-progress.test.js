import test from 'node:test';
import assert from 'node:assert/strict';
import {demoWorkspace,recordAttempt,editCard} from '../dist/core.js';
import {readWorkspace} from '../dist/storage.js';
import {formDraftKey,teacherDraftKey,stabilizeDraftWorkspace,clearDraftWorkspace,prepareTeacherDraft,hasVolatileDrafts,formDraftIsVolatile,readFormDraft,writeFormDraft,clearFormDraft,readPractice,writePractice} from '../dist/work-in-progress.js';
const memory = () => {const items=new Map();return {getItem:key=>items.get(key)??null,setItem:(key,value)=>items.set(key,value),removeItem:key=>items.delete(key)};};
const sessionFor=state=>({ids:state.cards.map(c=>c.id),index:0,mode:'practice',attemptIds:[],correct:0,feedback:null});

test('teacher drafts are separated by workspace and question version',()=>{
  const storage=memory(), first=formDraftKey('a','card-form','id:1'), next=formDraftKey('a','card-form','id:2');
  assert.equal(writeFormDraft(storage,first,{prompt:'Свой вопрос',excerpt:'Exact.Source!!'}),true);
  assert.equal(readFormDraft(storage,next),null);
  assert.equal(readFormDraft(storage,formDraftKey('b','card-form','id:1')),null);
  assert.deepEqual(readFormDraft(storage,first),{prompt:'Свой вопрос',excerpt:'Exact.Source!!'});
  clearFormDraft(storage,first);assert.equal(readFormDraft(storage,first),null);
});
test('malformed drafts and blocked storage do not replace learning data',()=>{
  const storage=memory();storage.setItem('bad','[1,2]');assert.equal(readFormDraft(storage,'bad'),null);
  const denied={getItem(){throw Error('denied')},setItem(){throw Error('full')},removeItem(){throw Error('denied')}};
  assert.equal(readFormDraft(denied,'key'),null);assert.equal(writeFormDraft(denied,'key',{prompt:'x'}),false);
  assert.equal(writePractice(denied,sessionFor(demoWorkspace()),demoWorkspace()),false);
});
test('reload restores an answered question from the real attempt, not a forged score',()=>{
  const storage=memory();let state=demoWorkspace(),session=sessionFor(state);
  state=recordAttempt(state,{cardId:session.ids[0],answer:'for',mode:'practice'});
  session.attemptIds.push(state.attempts.at(-1).id);session.correct=999;
  writePractice(storage,session,state);
  const restored=readPractice(storage,state).session;
  assert.equal(restored.correct,0);assert.equal(restored.feedback.answer,'for');assert.equal(restored.index,0);
  restored.index++;restored.feedback=null;writePractice(storage,restored,state);
  assert.equal(readPractice(storage,state).session.feedback,null);
});
test('changed workspace revisions or card versions prevent a stale practice restore',()=>{
  const storage=memory(),state=demoWorkspace(),session=sessionFor(state);
  writePractice(storage,session,state);
  const changed=editCard(state,state.cards[0].id,{prompt:'Updated question?'});
  assert.equal(readPractice(storage,changed).session,null);
  assert.equal(readPractice(storage,{...state,workspaceId:'other'}).session,null);
});
test('fabricated attempt references and invalid indexes cannot create a restored result',()=>{
  const storage=memory(),state=demoWorkspace(),session=sessionFor(state);
  session.attemptIds=['invented'];writePractice(storage,session,state);
  assert.equal(readPractice(storage,state).session,null);
  session.attemptIds=[];session.index=100;writePractice(storage,session,state);
  assert.equal(readPractice(storage,state).session,null);
});

test('the first unsaved deck draft remains discoverable across a page reload',()=>{
  const items=new Map(), temporary=()=>({getItem:key=>items.get(key)??null,setItem:(key,value)=>items.set(key,value),removeItem:key=>items.delete(key)});
  const learning={getItem:()=>null};
  const firstStorage=temporary(),first=stabilizeDraftWorkspace(firstStorage,readWorkspace(learning).state,null);
  const key=teacherDraftKey(first.workspaceId,'deck-form');
  writeFormDraft(firstStorage,key,{title:'Мой первый набор',language:'ru',description:'Ещё не отправлено'});
  const secondStorage=temporary(),reloaded=stabilizeDraftWorkspace(secondStorage,readWorkspace(learning).state,null);
  assert.equal(reloaded.workspaceId,first.workspaceId);
  assert.equal(readFormDraft(secondStorage,teacherDraftKey(reloaded.workspaceId,'deck-form')).title,'Мой первый набор');
  assert.equal(reloaded.decks.length,0);
  clearDraftWorkspace(secondStorage);
  const newEmpty=stabilizeDraftWorkspace(temporary(),readWorkspace(learning).state,null);
  assert.notEqual(newEmpty.workspaceId,first.workspaceId);
});

test('new-card and material drafts retain their selected deck independently of bank filters',()=>{
  const storage=memory();
  for(const form of ['card-form','material-form']){
    const key=teacherDraftKey('workspace',form);
    writeFormDraft(storage,key,{deckId:'second-deck',prompt:'Черновик вопроса',material:'Мой исходный материал'});
    const reopened=prepareTeacherDraft(readFormDraft(storage,teacherDraftKey('workspace',form)),[{id:'first-deck'},{id:'second-deck'}]);
    assert.equal(reopened.fields.deckId,'second-deck');
    assert.equal(reopened.missingDeck,false);
    assert.equal(readFormDraft(storage,teacherDraftKey('other-workspace',form)),null);
  }
  assert.notEqual(teacherDraftKey('workspace','card-form',{id:'card',version:1}),teacherDraftKey('workspace','card-form',{id:'card',version:2}));
  assert.notEqual(teacherDraftKey('workspace','card-form'),teacherDraftKey('workspace','card-form',{id:'card',version:1}));
});

test('a draft whose source deck is absent requires an explicit target without losing its text',()=>{
  const original={deckId:'removed-deck',prompt:'Не прикреплять к первому набору',material:'Точный авторский материал'};
  const restored=prepareTeacherDraft(original,[{id:'first-deck'}]);
  assert.equal(restored.missingDeck,true);
  assert.equal(restored.fields.deckId,'');
  assert.equal(restored.fields.prompt,original.prompt);
  assert.equal(restored.fields.material,original.material);
  assert.equal(original.deckId,'removed-deck');
});

test('denied draft storage retains text in memory across renders and tracks all at-risk forms',()=>{
  const denied={getItem(){throw Error('denied')},setItem(){throw Error('full')},removeItem(){throw Error('denied')}};
  assert.equal(writeFormDraft(denied,'first',{prompt:'Сохранить этот текст'}),false);
  assert.equal(writeFormDraft(denied,'second',{material:'И этот материал'}),false);
  assert.equal(readFormDraft(denied,'first').prompt,'Сохранить этот текст');
  assert.equal(formDraftIsVolatile(denied,'first'),true);
  assert.equal(hasVolatileDrafts(denied),true);
  clearFormDraft(denied,'second');
  assert.equal(hasVolatileDrafts(denied),true);
  clearFormDraft(denied,'first');
  assert.equal(readFormDraft(denied,'first'),null);
  assert.equal(hasVolatileDrafts(denied),false);
});

test('a failed newer write takes precedence over an older persisted draft until saved or cleared',()=>{
  let full=false;const items=new Map();
  const storage={getItem:key=>items.get(key)??null,setItem(key,value){if(full)throw Error('full');items.set(key,value);},removeItem:key=>items.delete(key)};
  writeFormDraft(storage,'draft',{prompt:'Старый текст'});full=true;
  assert.equal(writeFormDraft(storage,'draft',{prompt:'Новый текст после переполнения'}),false);
  assert.equal(readFormDraft(storage,'draft').prompt,'Новый текст после переполнения');
  assert.equal(hasVolatileDrafts(storage),true);
  full=false;writeFormDraft(storage,'different',{material:'Другой черновик'});
  assert.equal(hasVolatileDrafts(storage),true);
  writeFormDraft(storage,'draft',readFormDraft(storage,'draft'));
  assert.equal(hasVolatileDrafts(storage),false);
});

test('temporary draft identity never replaces a valid or corrupt learning workspace',()=>{
  const storage=memory(),state=demoWorkspace();
  assert.equal(stabilizeDraftWorkspace(storage,null,'broken-json'),null);
  assert.equal(stabilizeDraftWorkspace(storage,state,JSON.stringify(state)),state);
});
