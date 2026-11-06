import assert from 'node:assert/strict';
import test from 'node:test';
import { esc } from './util.js';

// Issue #11 — story captions arrive through `?config=` (base64url JSON in the
// URL) and used to reach the built page's DOM unescaped.

test('esc neutralises the ticket payload but keeps ordinary text', () => {
  const payload = 'Hello <img src=x onerror="alert(document.domain)">';
  const out = esc(payload);
  assert.ok(!/[<>"']/.test(out), `expected every markup char escaped, got: ${out}`);
  assert.ok(out.includes('&lt;img'), 'tag opener must be escaped');
  assert.equal(esc("a & b 'c' \"d\""), 'a &amp; b &#39;c&#39; &quot;d&quot;');
  assert.equal(esc('plain caption — 42%'), 'plain caption — 42%');
  assert.equal(esc(undefined), 'undefined'.replace('undefined', '')); // String(undefined ?? '') === ''
  assert.equal(esc(null), '');
});

test('the word pipeline survives asterisk markers after escaping', () => {
  // mirrors director.js: strip the *hl* markers, then escape the remainder
  const w = '*bold*';
  const stripped = w.replace(/^\*|\*$/g, '');
  assert.equal(esc(stripped), 'bold');
});
