import test from 'node:test';
import assert from 'node:assert/strict';
import {excerptSegments} from '../dist/review-format.js';

test('highlight slices preserve every source character, including punctuation without spaces', () => {
  for (const text of [
    'Use since for the starting point of a period. Use for for a length of time.',
    'First.Second!!Third?Since then.',
    '\n  Since…\nследующая строка! Без пробелов.Конец',
    '<img src=x onerror=alert(1)> Since & «текст».',
    'Since?Since!Since...'
  ]) {
    assert.equal(excerptSegments(text, 'since').join(''), text);
  }
});

test('a missing or empty answer creates no highlighted claim', () => {
  assert.deepEqual(excerptSegments('Exact text.', 'absent'), ['Exact text.', '', '']);
  assert.deepEqual(excerptSegments('Exact text.', ''), ['Exact text.', '', '']);
});
