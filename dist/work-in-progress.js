const PRACTICE_KEY = 'sabaqloop.practice.v1';
const EMPTY_WORKSPACE_KEY = 'sabaqloop.empty-workspace.v1';
const draftMemory = new WeakMap();
const emptyWorkspaceMemory = new WeakMap();

function draftsFor(storage) {
  if (!draftMemory.has(storage)) draftMemory.set(storage, new Map());
  return draftMemory.get(storage);
}

// The first form can exist before learning data has ever been saved. Keep its
// workspace identity stable in this tab without writing an empty learning copy.
export function stabilizeDraftWorkspace(storage, state, raw) {
  if (!state) return state;
  if (raw !== null || state.revision !== 0 || state.decks.length || state.cards.length || state.attempts.length) {
    clearDraftWorkspace(storage);
    return state;
  }
  let workspaceId = emptyWorkspaceMemory.get(storage);
  try { workspaceId ||= storage.getItem(EMPTY_WORKSPACE_KEY); } catch { /* Memory still covers in-page reloads. */ }
  if (typeof workspaceId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspaceId)) workspaceId = state.workspaceId;
  emptyWorkspaceMemory.set(storage, workspaceId);
  try { storage.setItem(EMPTY_WORKSPACE_KEY, workspaceId); } catch { /* Draft writes report their own durability. */ }
  return {...state, workspaceId};
}

export function clearDraftWorkspace(storage) {
  emptyWorkspaceMemory.delete(storage);
  try { storage.removeItem(EMPTY_WORKSPACE_KEY); } catch { /* Learning data has a separate storage path. */ }
}

export function formDraftKey(workspaceId, formId, target = '') {
  return `sabaqloop.form.v1:${workspaceId}:${formId}:${target}`;
}

export function teacherDraftKey(workspaceId, formId, card) {
  const target = formId === 'card-form' && card ? `${card.id}:${card.version}` : 'new';
  return formDraftKey(workspaceId, formId, target);
}

export function prepareTeacherDraft(fields, decks) {
  const missingDeck = Object.hasOwn(fields, 'deckId') && !decks.some(deck => deck.id === fields.deckId);
  return {fields: {...fields, ...(missingDeck ? {deckId: ''} : {})}, missingDeck};
}

export function formDraftIsVolatile(storage, key) {
  const draft = draftsFor(storage).get(key);
  return !!draft && draft.raw !== null && !draft.persisted;
}

export function hasVolatileDrafts(storage) {
  return [...draftsFor(storage).values()].some(draft => draft.raw !== null && !draft.persisted);
}

export function readFormDraft(storage, key) {
  try {
    const cached = draftsFor(storage).get(key);
    const raw = cached ? cached.raw : storage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null;
    if (Object.entries(draft).some(([key, value]) => key.length > 100 || typeof value !== 'string' || value.length > 40000)) return null;
    return draft;
  } catch { return null; }
}

export function writeFormDraft(storage, key, fields) {
  let raw;
  try { raw = JSON.stringify(fields); } catch { return false; }
  draftsFor(storage).set(key, {raw, persisted: false});
  try { storage.setItem(key, raw); draftsFor(storage).set(key, {raw, persisted: true}); return true; }
  catch { return false; }
}

export function clearFormDraft(storage, key) {
  // A tombstone also prevents a failed remove from resurrecting a submitted form
  // during this page's next render.
  draftsFor(storage).set(key, {raw: null, persisted: true});
  try { storage.removeItem(key); } catch { /* Saved learning data is independent. */ }
}

export function readPractice(storage, state) {
  try {
    const raw = storage.getItem(PRACTICE_KEY);
    if (!raw || !state) return {session:null, message:''};
    const saved = JSON.parse(raw);
    if (saved.workspaceId !== state.workspaceId || saved.revision !== state.revision) throw Error('changed');
    if (!['practice','review'].includes(saved.mode) || !Array.isArray(saved.ids) || !saved.ids.length || new Set(saved.ids).size !== saved.ids.length) throw Error('invalid');
    if (!Array.isArray(saved.versions) || saved.versions.length !== saved.ids.length || !Array.isArray(saved.attemptIds)) throw Error('invalid');
    if (!Number.isInteger(saved.index) || saved.index < 0 || saved.index > saved.ids.length) throw Error('invalid');
    if (![saved.index, Math.min(saved.index + 1,saved.ids.length)].includes(saved.attemptIds.length)) throw Error('invalid');
    const cards = saved.ids.map((id,index) => state.cards.find(card => card.id===id && card.status==='approved' && card.version===saved.versions[index]));
    if (cards.some(card => !card)) throw Error('changed');
    const attempts = saved.attemptIds.map((id,index) => state.attempts.find(a => a.id===id && a.cardId===saved.ids[index] && a.version===saved.versions[index] && a.mode===saved.mode));
    if (attempts.some(attempt => !attempt) || new Set(saved.attemptIds).size !== saved.attemptIds.length) throw Error('invalid');
    const last = attempts.length > saved.index ? attempts.at(-1) : null;
    return {session:{ids:saved.ids,index:saved.index,mode:saved.mode,attemptIds:saved.attemptIds,correct:attempts.filter(a=>a.correct).length,feedback:last?{correct:last.correct,answer:last.answer}:null},message:'Незавершённый круг восстановлен. Сохранённые ответы не отправляются повторно.'};
  } catch {
    return {session:null,message:'Предыдущий круг не восстановлен: данные или версии заданий изменились. Сохранённые ответы остались в истории.'};
  }
}

export function writePractice(storage, session, state) {
  try {
    if (!session || !state) storage.removeItem(PRACTICE_KEY);
    else storage.setItem(PRACTICE_KEY,JSON.stringify({workspaceId:state.workspaceId,revision:state.revision,ids:session.ids,versions:session.ids.map(id=>state.cards.find(card=>card.id===id)?.version),index:session.index,mode:session.mode,attemptIds:session.attemptIds}));
    return true;
  } catch { return false; }
}
