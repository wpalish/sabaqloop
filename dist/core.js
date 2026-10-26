export const SCHEMA_VERSION = 1;
export const MAX_BACKUP_BYTES = 5_000_000;
const DAY = 86_400_000;
const INTERVALS = [1, 3, 7, 14, 30];
const STATUSES = new Set(['draft', 'approved', 'archived']);
const LANGUAGES = new Set(['ru', 'kk', 'en', 'mixed']);
export const id = () => crypto.randomUUID();
function identifier(value, label) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,99}$/.test(value) || ['__proto__','constructor','prototype','toString','hasOwnProperty'].includes(value)) throw new Error(`${label}: недопустимый идентификатор.`);
  return value;
}
const clone = x => structuredClone(x);
const timestamp = value => {
  const n = Date.parse(value);
  if (!Number.isFinite(n)) throw new Error('Некорректная дата.');
  return new Date(n).toISOString();
};
function text(value, label, min = 0, max = 12000) {
  if (typeof value !== 'string' || value.trim().length < min || value.length > max) {
    throw new Error(`${label}: допустимая длина ${min}–${max} символов.`);
  }
  return value.trim();
}
export function normalizeAnswer(value) {
  return String(value).normalize('NFKC').toLocaleLowerCase().trim()
    .replace(/[’‘]/gu, "'").replace(/[“”]/gu, '"')
    .replace(/\s+/gu, ' ')
    .replace(/^[\s.,!?;:"'«»…]+|[\s.,!?;:"'«»…]+$/gu, '');
}
export function safeUrl(value = '') {
  if (!value) return '';
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Ссылка на источник должна начинаться с https:// или http://.');
  }
  return url.href;
}
function source(value) {
  if (!value || typeof value !== 'object') throw new Error('Добавьте источник задания.');
  return {title: text(value.title, 'Название источника', 1, 300), url: safeUrl(value.url), excerpt: text(value.excerpt, 'Фрагмент источника', 1, 12000)};
}
export function makeDeck(input, now = new Date().toISOString()) {
  if (!LANGUAGES.has(input.language || 'ru')) throw new Error('Выберите язык материала.');
  return {id: identifier(input.id || id(), 'ID набора'), title: text(input.title, 'Название набора', 2, 180), description: text(input.description || '', 'Описание', 0, 1000), language: input.language || 'ru', createdAt: timestamp(now), demo: input.demo === true};
}
export function makeCard(input, now = new Date().toISOString()) {
  const type = input.type || 'short';
  if (!['short', 'single'].includes(type)) throw new Error('Неизвестный тип задания.');
  const answer = text(input.answer, 'Правильный ответ', 1, 500);
  const options = (input.options || []).map(x => text(x, 'Вариант ответа', 1, 500));
  if (type === 'single' && (options.length < 2 || options.length > 6 || !options.includes(answer))) {
    throw new Error('Добавьте 2–6 вариантов и выберите правильный ответ из них.');
  }
  if (new Set(options.map(normalizeAnswer)).size !== options.length) throw new Error('Варианты ответа должны различаться.');
  const status = input.status || 'draft';
  if (!STATUSES.has(status)) throw new Error('Неизвестный статус задания.');
  if (!Number.isSafeInteger(input.version || 1) || (input.version || 1) < 1) throw new Error('Некорректная версия задания.');
  return {
    id: identifier(input.id || id(), 'ID задания'), deckId: identifier(input.deckId, 'Набор'), version: input.version || 1,
    prompt: text(input.prompt, 'Вопрос', 4, 2000), type, answer,
    aliases: (input.aliases || []).map(a => text(a, 'Допустимый ответ', 1, 500)),
    options: type === 'single' ? options : [], explanation: text(input.explanation || '', 'Объяснение', 0, 3000),
    source: source(input.source), status, createdAt: timestamp(input.createdAt || now), updatedAt: timestamp(now)
  };
}
export function createWorkspace(now = new Date().toISOString()) {
  return {schemaVersion: SCHEMA_VERSION, workspaceId: id(), revision: 0, updatedAt: timestamp(now), decks: [], cards: [], attempts: [], reviews: {}};
}
export function validateWorkspace(raw) {
  if (!raw || raw.schemaVersion !== SCHEMA_VERSION || !Array.isArray(raw.decks) || !Array.isArray(raw.cards) || !Array.isArray(raw.attempts)) {
    throw new Error('Это не резервная копия SabaqLoop версии 1.');
  }
  if (raw.decks.length > 500 || raw.cards.length > 10000 || raw.attempts.length > 50000) throw new Error('Резервная копия превышает ограничения этой версии.');
  if (!Number.isSafeInteger(raw.revision) || raw.revision < 0) throw new Error('Некорректная версия данных.');
  const decks = raw.decks.map(d => makeDeck(d, d.createdAt));
  const deckIds = new Set(decks.map(d => d.id));
  if (decks.length !== deckIds.size) throw new Error('В копии повторяются наборы.');
  const cards = raw.cards.map(c => makeCard(c, c.updatedAt));
  const cardIds = new Set(cards.map(c => c.id));
  if (cards.length !== cardIds.size) throw new Error('В копии повторяются задания.');
  for (const c of cards) {
    if (!deckIds.has(c.deckId) || !Number.isSafeInteger(c.version) || c.version < 1) throw new Error('Нарушена связь задания с набором или его версия.');
  }
  const attempts = raw.attempts.map(a => {
    if (!a || !cardIds.has(a.cardId) || !['practice', 'review'].includes(a.mode) || typeof a.correct !== 'boolean' || !Number.isSafeInteger(a.version) || a.version < 1) throw new Error('В копии некорректная попытка.');
    const snapshot = makeCard(a.snapshot, a.snapshot?.updatedAt);
    if (snapshot.id !== a.cardId || snapshot.version !== a.version) throw new Error('Снимок задания не соответствует попытке.');
    const answer = text(a.answer, 'Ответ в истории', 0, 2000);
    if (grade(snapshot, answer) !== a.correct) throw new Error('Результат попытки не совпадает с сохраненным заданием.');
    return {id: text(a.id, 'ID попытки', 1, 100), cardId: a.cardId, version: a.version, answer, correct: a.correct, at: timestamp(a.at), mode: a.mode, snapshot};
  });
  if (new Set(attempts.map(a => a.id)).size !== attempts.length) throw new Error('Повторяются ID попыток.');
  const reviews = {};
  for (const [cardId, r] of Object.entries(raw.reviews || {})) {
    const c = cards.find(c => c.id === cardId);
    if (!c || r.version !== c.version) continue;
    if (!Number.isSafeInteger(r.streak) || r.streak < 0 || r.streak > 100000 || typeof r.lastCorrect !== 'boolean') throw new Error('Некорректные данные повторения.');
    reviews[cardId] = {version: r.version, streak: r.streak, dueAt: timestamp(r.dueAt), lastCorrect: r.lastCorrect};
  }
  return {schemaVersion: SCHEMA_VERSION, workspaceId: identifier(raw.workspaceId, 'ID рабочей области'), revision: raw.revision, updatedAt: timestamp(raw.updatedAt), decks, cards, attempts, reviews};
}
export function parseBackup(input) {
  if (typeof input !== 'string' || new TextEncoder().encode(input).length > MAX_BACKUP_BYTES) throw new Error('Файл должен быть JSON размером до 5 МБ.');
  let parsed;
  try { parsed = JSON.parse(input); } catch { throw new Error('Не удалось прочитать JSON. Текущие данные не изменены.'); }
  if (parsed && typeof parsed === 'object' && Object.hasOwn(parsed,'workspace')) {
    if (parsed.application !== 'SabaqLoop') throw new Error('Это не файл резервной копии SabaqLoop. Текущие данные не изменены.');
    return validateWorkspace(parsed.workspace);
  }
  return validateWorkspace(parsed);
}
export function encodeBackup(state) {
  return JSON.stringify({application: 'SabaqLoop', exportedAt: new Date().toISOString(), workspace: validateWorkspace(state)}, null, 2);
}
function update(state, now, fn) {
  const next = clone(state);
  fn(next);
  next.revision++;
  next.updatedAt = timestamp(now);
  return next;
}
export function addDeck(state, input, now = new Date().toISOString()) {
  const deck = makeDeck(input, now);
  if (state.decks.some(d => d.id === deck.id)) throw new Error('Набор с таким ID уже существует.');
  return update(state, now, next => next.decks.push(deck));
}
export function addCards(state, inputs, now = new Date().toISOString()) {
  const cards = inputs.map(c => makeCard(c, now));
  const known = new Set(state.cards.map(c => c.id));
  for (const c of cards) {
    if (!state.decks.some(d => d.id === c.deckId)) throw new Error('Набор не найден.');
    if (known.has(c.id)) throw new Error('Задание с таким ID уже существует.');
    known.add(c.id);
  }
  return update(state, now, next => next.cards.push(...cards));
}
export function editCard(state, cardId, changes, now = new Date().toISOString()) {
  const current = state.cards.find(c => c.id === cardId);
  if (!current) throw new Error('Задание не найдено.');
  const edited = makeCard({...current, ...changes, id: current.id, deckId: current.deckId, version: current.version + 1, status: 'draft'}, now);
  return update(state, now, next => {
    next.cards[next.cards.findIndex(c => c.id === cardId)] = edited;
    delete next.reviews[cardId];
  });
}
export function setStatus(state, cardId, status, now = new Date().toISOString()) {
  if (!STATUSES.has(status)) throw new Error('Неизвестный статус задания.');
  const current = state.cards.find(c => c.id === cardId);
  if (!current) throw new Error('Задание не найдено.');
  makeCard({...current, status}, now);
  return update(state, now, next => { next.cards.find(c => c.id === cardId).status = status; });
}
export function grade(card, answer) {
  const entered = normalizeAnswer(answer);
  if (!entered) return false;
  if (card.type === 'single') return entered === normalizeAnswer(card.answer);
  return [card.answer, ...card.aliases].some(a => entered === normalizeAnswer(a));
}
export function recordAttempt(state, {cardId, answer, mode = 'practice', at = new Date().toISOString()}) {
  const card = state.cards.find(c => c.id === cardId);
  if (!card || card.status !== 'approved') throw new Error('Практика доступна только для проверенных заданий.');
  if (!['practice', 'review'].includes(mode)) throw new Error('Неизвестный режим практики.');
  const entered = text(answer, 'Ответ', 0, 2000);
  const correct = grade(card, entered);
  const previous = state.reviews[cardId];
  const oldStreak = previous?.version === card.version ? previous.streak : 0;
  const streak = correct ? oldStreak + 1 : 0;
  const dueAt = new Date(Date.parse(timestamp(at)) + (correct ? INTERVALS[Math.min(streak - 1, INTERVALS.length - 1)] * DAY : 0)).toISOString();
  return update(state, at, next => {
    next.attempts.push({id: id(), cardId, version: card.version, answer: entered, correct, at: timestamp(at), mode, snapshot: clone(card)});
    next.reviews[cardId] = {version: card.version, streak, dueAt, lastCorrect: correct};
  });
}
export function dueCards(state, now = new Date().toISOString(), deckId = null) {
  return state.cards.filter(c => c.status === 'approved' && (!deckId || c.deckId === deckId) && state.reviews[c.id] && Date.parse(state.reviews[c.id].dueAt) <= Date.parse(now));
}
export function summary(state, now = new Date().toISOString()) {
  const approved = state.cards.filter(c => c.status === 'approved');
  const currentResults = approved.map(c => state.reviews[c.id]).filter(Boolean);
  return {decks: state.decks.length, approved: approved.length, drafts: state.cards.filter(c => c.status === 'draft').length, attempts: state.attempts.length, correct: state.attempts.filter(a => a.correct).length, mistakes: currentResults.filter(r => !r.lastCorrect).length, due: dueCards(state, now).length};
}
const stopwords = new Set('about after again their there these those which would should через чтобы этого также между после перед будет можно который которая которые поскольку потому деген үшін және болып немесе бірақ кезде туралы'.split(' '));
export function draftFromText({deckId, title, url = '', material, limit = 8}, now = new Date().toISOString()) {
  const content = text(material, 'Учебный материал', 30, 40000);
  const sourceTitle = text(title, 'Название источника', 1, 300);
  const sourceUrl = safeUrl(url);
  const sentences = content.split(/(?<=[.!?。])\s+|\n+/u).map(s => s.trim()).filter(s => s.length >= 35 && s.length <= 450);
  const chosen = [];
  const used = new Set();
  for (const sentence of sentences) {
    const terms = [...sentence.matchAll(/[\p{L}][\p{L}\p{M}-]{4,}/gu)].map(m => ({word: m[0], index: m.index})).filter(t => !stopwords.has(normalizeAnswer(t.word)) && !used.has(normalizeAnswer(t.word)));
    terms.sort((a,b) => b.word.length - a.word.length || a.index - b.index);
    const term = terms[0];
    if (!term) continue;
    used.add(normalizeAnswer(term.word));
    const prompt = sentence.slice(0, term.index) + '______' + sentence.slice(term.index + term.word.length);
    chosen.push(makeCard({deckId, type: 'short', prompt, answer: term.word, explanation: 'Восстановите слово из исходного материала. Преподаватель проверяет однозначность задания перед практикой.', source: {title: sourceTitle, url: sourceUrl, excerpt: sentence}, status: 'draft'}, now));
    if (chosen.length >= Math.min(20, Math.max(1, limit))) break;
  }
  if (!chosen.length) throw new Error('Недостаточно подходящих предложений. Добавьте связный текст или создайте задание вручную.');
  return chosen;
}
export function demoWorkspace(now = new Date().toISOString()) {
  let state = addDeck(createWorkspace(now), {title: 'English · учебный пример', description: 'Оригинальные демонстрационные задания. Это не официальный IELTS-тест.', language: 'en', demo: true}, now);
  const deckId = state.decks[0].id;
  const input = [
    {prompt: 'Complete: She has lived in Astana ___ 2021.', answer: 'since', type: 'single', options: ['since','for','during'], explanation: 'Since обозначает начальную точку периода; for — продолжительность.', source: {title: 'SabaqLoop · оригинальный учебный пример', url: '', excerpt: 'Use since for the starting point of a period. Use for for a length of time.'}},
    {prompt: 'Write one word: a word with the opposite meaning is an ______.', answer: 'antonym', type: 'short', aliases: ['an antonym'], explanation: 'An antonym is a word with the opposite meaning.', source: {title: 'SabaqLoop · оригинальный учебный пример', url: '', excerpt: 'An antonym is a word with the opposite meaning. Hot and cold are antonyms.'}},
    {prompt: 'Choose the correct sentence.', answer: 'The results were published yesterday.', type: 'single', options: ['The results was published yesterday.','The results were published yesterday.','The results is publish yesterday.'], explanation: 'Results — множественное число. Для прошедшего времени пассивного залога здесь нужно were published.', source: {title: 'SabaqLoop · оригинальный учебный пример', url: '', excerpt: 'Plural subjects use were in the past simple passive: the results were published.'}}
  ];
  return addCards(state, input.map(c => ({...c, deckId, status: 'approved'})), now);
}
