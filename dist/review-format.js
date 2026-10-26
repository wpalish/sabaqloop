// Return lossless slices: highlighting must never rewrite the exact source.
export function excerptSegments(text, answer) {
  const match = answer ? text.toLocaleLowerCase().indexOf(answer.toLocaleLowerCase()) : -1;
  if (match < 0) return [text, '', ''];
  let start = match;
  while (start > 0 && !'.!?\n'.includes(text[start - 1])) start--;
  while (start < match && /\s/u.test(text[start])) start++;
  let end = match + answer.length;
  while (end < text.length && !'.!?\n'.includes(text[end])) end++;
  if (end < text.length && text[end] !== '\n') end++;
  return [text.slice(0, start), text.slice(start, end), text.slice(end)];
}
