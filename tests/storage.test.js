import test from "node:test";
import assert from "node:assert/strict";
import { demoWorkspace, recordAttempt } from "../dist/core.js";
import {
  readWorkspace,
  saveWorkspace,
  restoreWorkspace,
  STORAGE_KEY,
  RECOVERY_KEY,
} from "../dist/storage.js";
const NOW = "2026-10-24T09:00:00.000Z";
function memory() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
}
test("a stale tab cannot overwrite a newer attempt", () => {
  const store = memory(),
    s = demoWorkspace(NOW);
  restoreWorkspace(s, store);
  const a = recordAttempt(s, {
    cardId: s.cards[0].id,
    answer: "since",
    at: NOW,
  });
  saveWorkspace(a, s.revision, store);
  const stale = recordAttempt(s, {
    cardId: s.cards[1].id,
    answer: "antonym",
    at: NOW,
  });
  assert.throws(
    () => saveWorkspace(stale, s.revision, store),
    /другой вкладке/,
  );
  assert.equal(readWorkspace(store).state.attempts[0].cardId, s.cards[0].id);
});
test("corruption is preserved and never silently reset", () => {
  const store = memory();
  store.setItem(STORAGE_KEY, "not-json");
  const result = readWorkspace(store);
  assert.equal(result.state, null);
  assert.equal(result.raw, "not-json");
  assert.equal(store.getItem(STORAGE_KEY), "not-json");
});
test("restoring a backup retains the previous local copy for recovery", () => {
  const store = memory(),
    s = demoWorkspace(NOW);
  restoreWorkspace(s, store);
  const original = store.getItem(STORAGE_KEY),
    replacement = demoWorkspace(NOW);
  restoreWorkspace(replacement, store);
  assert.equal(store.getItem(RECOVERY_KEY), original);
  assert.equal(readWorkspace(store).state.workspaceId, replacement.workspaceId);
});
test("storage denial returns an actionable error without inventing saved state", () => {
  const denied = {
    getItem() {
      throw new Error("denied");
    },
    setItem() {
      throw new Error("denied");
    },
  };
  assert.equal(readWorkspace(denied).state, null);
});
