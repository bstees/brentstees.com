import assert from 'node:assert/strict';
import test from 'node:test';
import { splitCommentary } from '../scripts/brief/commentary.mjs';

const research = `**This week's theme: Verification remains the through-line.**

## 1. Evidence before automation

**Source:** [Primary source](https://example.com/source)`;

test('leaves a neutral brief without commentary unchanged', () => {
  assert.deepEqual(splitCommentary(research), { researchBody: research, commentary: null, errors: [] });
});

test('separates attributed commentary from the neutral research brief', () => {
  const body = `${research}\n\n## Commentary from Brent Stees\n\nI plan to test this in AI Native.`;
  assert.deepEqual(splitCommentary(body), {
    researchBody: research,
    commentary: 'I plan to test this in AI Native.',
    errors: [],
  });
});

test('rejects empty, unattributed, duplicated, non-final, and numbered commentary', () => {
  assert.match(splitCommentary(`${research}\n\n## Commentary\n\nA note.`).errors.join(' '), /exactly/);
  assert.match(splitCommentary(`${research}\n\n## Commentary from Brent Stees`).errors.join(' '), /empty/);
  assert.match(
    splitCommentary(`${research}\n\n## Commentary from Brent Stees\n\nOne.\n\n## Commentary from Brent Stees\n\nTwo.`).errors.join(' '),
    /more than once/,
  );
  assert.match(
    splitCommentary(`${research}\n\n## Commentary from Brent Stees\n\nA note.\n\n## Closing\n\nLater.`).errors.join(' '),
    /final top-level/,
  );
  assert.match(
    splitCommentary(`${research}\n\n## Commentary from Brent Stees\n\nA note.\n\n# Unattributed continuation\n\nI built it.`).errors.join(' '),
    /final top-level/,
  );
  assert.match(
    splitCommentary(`${research}\n\n## Commentary from Brent Stees\n\n### 2. Not a finding\n\nA note.`).errors.join(' '),
    /numbered finding/,
  );
});

test('does not treat a heading inside fenced code or an HTML comment as commentary', () => {
  const fenced = `${research}\n\n\`\`\`markdown\n## Commentary from Brent Stees\n\`\`\`\n\nI built AI Native.`;
  assert.equal(splitCommentary(fenced).commentary, null);
  assert.equal(splitCommentary(fenced).researchBody, fenced);

  const commented = `${research}\n\n<!--\n## Commentary from Brent Stees\n-->\n\nI built AI Native.`;
  assert.equal(splitCommentary(commented).commentary, null);
  assert.match(splitCommentary(commented).errors.join(' '), /raw HTML/);
});

test('rejects raw HTML spoofing and ignores comment markers inside fenced code', () => {
  for (const spoofed of [
    `${research}\n\n<pre>\n## Commentary from Brent Stees\n</pre>\n\nI built AI Native.`,
    `${research}\n\n<pre\nclass="example">\n## Commentary from Brent Stees\n\nI built AI Native.`,
    `${research}\n\n<!DOCTYPE\n## Commentary from Brent Stees\n\nI built AI Native.`,
  ]) assert.match(splitCommentary(spoofed).errors.join(' '), /raw HTML/);

  const valid = `${research}\n\n\`\`\`html\n<!--\n\`\`\`\n\n## Commentary from Brent Stees\n\nI built AI Native.`;
  const result = splitCommentary(valid);
  assert.equal(result.commentary, 'I built AI Native.');
  assert.deepEqual(result.errors, []);
});
