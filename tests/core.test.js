import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorkspace,
  addDeck,
  addCards,
  demoWorkspace,
  grade,
  setStatus,
  recordAttempt,
  editCard,
  dueCards,
  summary,
  draftFromText,
  parseBackup,
  encodeBackup,
  validateWorkspace,
  safeUrl,
} from "../dist/core.js";
const NOW = "2026-10-24T09:00:00.000Z";

test("a draft cannot enter practice before teacher approval", () => {
  const state = demoWorkspace(NOW);
  const draft = setStatus(state, state.cards[0].id, "draft", NOW);
  assert.throws(
    () =>
      recordAttempt(draft, {
        cardId: draft.cards[0].id,
        answer: "since",
        at: NOW,
      }),
    /проверенных/,
  );
  assert.equal(state.cards[0].status, "approved");
});
test("strict short-answer grading preserves numbers and accepts only declared alternatives", () => {
  const c = demoWorkspace(NOW).cards[1];
  assert.equal(grade(c, " AN ANTONYM. "), true);
  assert.equal(grade(c, "synonym"), false);
  assert.equal(grade({ ...c, answer: "3.14", aliases: [] }, "314"), false);
  assert.equal(grade(c, ""), false);
});
test("wrong answers enter the due queue and successful reviews move them forward", () => {
  const s = demoWorkspace(NOW),
    cardId = s.cards[0].id;
  const wrong = recordAttempt(s, { cardId, answer: "for", at: NOW });
  assert.equal(dueCards(wrong, NOW).length, 1);
  assert.equal(summary(wrong, NOW).mistakes, 1);
  const right = recordAttempt(wrong, {
    cardId,
    answer: "since",
    mode: "review",
    at: NOW,
  });
  assert.equal(dueCards(right, NOW).length, 0);
  assert.equal(right.reviews[cardId].dueAt, "2026-10-25T09:00:00.000Z");
  assert.equal(s.attempts.length, 0);
});
test("editing creates a new draft without rewriting historical questions or grades", () => {
  const s = demoWorkspace(NOW),
    cardId = s.cards[0].id;
  const attempted = recordAttempt(s, { cardId, answer: "since", at: NOW });
  const changed = editCard(
    attempted,
    cardId,
    {
      prompt: "Another valid question",
      answer: "for",
      options: ["since", "for", "during"],
    },
    NOW,
  );
  assert.equal(changed.cards[0].version, 2);
  assert.equal(changed.cards[0].status, "draft");
  assert.equal(changed.attempts[0].snapshot.answer, "since");
  assert.equal(changed.attempts[0].correct, true);
  assert.equal(changed.reviews[cardId], undefined);
});
test("backup round trip retains original histories and due schedules", () => {
  const s = demoWorkspace(NOW);
  const attempted = recordAttempt(s, {
    cardId: s.cards[0].id,
    answer: "for",
    at: NOW,
  });
  assert.deepEqual(parseBackup(encodeBackup(attempted)), attempted);
});
test("corrupt files, duplicate IDs, invalid relations and forged grades are rejected", () => {
  assert.throws(() => parseBackup("{oops"), /JSON/);
  const s = demoWorkspace(NOW);
  const duplicate = structuredClone(s);
  duplicate.cards.push(duplicate.cards[0]);
  assert.throws(() => validateWorkspace(duplicate), /повторяются/);
  const missing = structuredClone(s);
  missing.cards[0].deckId = "not-a-deck";
  assert.throws(() => validateWorkspace(missing), /связь/);
  const forged = recordAttempt(s, {
    cardId: s.cards[0].id,
    answer: "for",
    at: NOW,
  });
  forged.attempts[0].correct = true;
  assert.throws(() => validateWorkspace(forged), /Результат/);
});
test("unsafe source URLs and embedded credentials are rejected", () => {
  assert.throws(() => safeUrl("javascript:alert(1)"));
  assert.throws(() => safeUrl("https://person:secret@example.com"));
  assert.equal(
    safeUrl("https://example.com/lesson"),
    "https://example.com/lesson",
  );
});
test("text drafts are grounded in exact source excerpts and remain unapproved", () => {
  const material =
    "Photosynthesis converts light energy into chemical energy in plants. Chlorophyll absorbs light used in this biological process.";
  const cards = draftFromText(
    { deckId: "deck", title: "Teacher notes", material },
    NOW,
  );
  assert.equal(cards.length, 2);
  for (const c of cards) {
    assert.equal(c.status, "draft");
    assert.ok(material.includes(c.source.excerpt));
    assert.ok(c.source.excerpt.includes(c.answer));
    assert.ok(c.prompt.includes("______"));
  }
});
test("single-choice answers must be among distinct options", () => {
  const s = demoWorkspace(NOW),
    c = s.cards[0];
  assert.throws(
    () => addCards(s, [{ ...c, id: crypto.randomUUID(), answer: "none" }], NOW),
    /выберите/,
  );
  assert.throws(
    () =>
      addCards(
        s,
        [
          {
            ...c,
            id: crypto.randomUUID(),
            options: ["since", "Since"],
            answer: "since",
          },
        ],
        NOW,
      ),
    /различаться/,
  );
});
test("empty workspaces contain no fabricated learner results", () => {
  const s = createWorkspace(NOW);
  assert.deepEqual(summary(s, NOW), {
    decks: 0,
    approved: 0,
    drafts: 0,
    attempts: 0,
    correct: 0,
    mistakes: 0,
    due: 0,
  });
  assert.equal(addDeck(s, { title: "My own material" }, NOW).decks.length, 1);
});
