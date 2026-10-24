import {createWorkspace, parseBackup, validateWorkspace} from './core.js';
export const STORAGE_KEY = 'sabaqloop.workspace.v1';
export const RECOVERY_KEY = 'sabaqloop.recovery.v1';
export function readWorkspace(storage = localStorage) {
  let raw;
  try { raw = storage.getItem(STORAGE_KEY); }
  catch { return {state:null,raw:null,error:'Браузер не разрешил доступ к хранилищу. Разрешите данные сайта или используйте другой профиль.'}; }
  if (!raw) return {state:createWorkspace(),raw:null,error:null};
  try { return {state:parseBackup(raw),raw,error:null}; }
  catch (e) { return {state:null,raw,error:`Не удалось открыть сохраненные данные: ${e.message} Сначала сохраните поврежденную копию; данные не сброшены.`}; }
}
export function saveWorkspace(next, expectedRevision, storage = localStorage) {
  const checked = validateWorkspace(next);
  const raw = storage.getItem(STORAGE_KEY);
  if (raw) {
    const current = parseBackup(raw);
    if (current.revision !== expectedRevision || current.workspaceId !== checked.workspaceId) throw new Error('Данные изменились в другой вкладке. Сохраните введенный текст отдельно и нажмите «Обновить данные».');
  } else if (expectedRevision !== 0) {
    throw new Error('Локальная копия была удалена в другой вкладке. Экспортируйте текущие данные перед восстановлением.');
  }
  try { storage.setItem(STORAGE_KEY,JSON.stringify(checked)); }
  catch { throw new Error('Не удалось сохранить данные: закончилось место или хранилище заблокировано. Экспортируйте резервную копию.'); }
  return checked;
}
export function restoreWorkspace(next, storage = localStorage) {
  const checked = validateWorkspace(next);
  const previous = storage.getItem(STORAGE_KEY);
  if (previous) storage.setItem(RECOVERY_KEY, previous);
  storage.setItem(STORAGE_KEY,JSON.stringify(checked));
  return checked;
}
