/**
 * Custom Assertion Utilities for Oxford 3000 E2E Harness
 * Provides type checking, contract verification, LTR CSS validation, and dist artifact inspection.
 */

import fs from 'node:fs';
import path from 'node:path';

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export const assert = {
  strictEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        actual,
        expected
      );
    }
  },

  deepStrictEqual(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new AssertionError(
        message || `Deep equality failed:\nActual: ${actualStr}\nExpected: ${expectedStr}`,
        actual,
        expected
      );
    }
  },

  ok(value, message = 'Expected truthy value') {
    if (!value) {
      throw new AssertionError(message, value, true);
    }
  },

  fail(message = 'Failed') {
    throw new AssertionError(message, false, true);
  },

  isFunction(fn, message = 'Expected function') {
    if (typeof fn !== 'function') {
      throw new AssertionError(message, typeof fn, 'function');
    }
  },

  isNumber(val, message = 'Expected number') {
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new AssertionError(message, typeof val, 'number');
    }
  },

  includes(haystack, needle, message = '') {
    const contains = Array.isArray(haystack)
      ? haystack.includes(needle)
      : String(haystack).includes(needle);
    if (!contains) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(haystack)} to include ${JSON.stringify(needle)}`,
        haystack,
        needle
      );
    }
  },

  match(str, pattern, message = '') {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    if (!regex.test(String(str))) {
      throw new AssertionError(
        message || `Expected string matching ${regex}, got: "${str}"`,
        str,
        pattern
      );
    }
  },

  matches(str, pattern, message = '') {
    return assert.match(str, pattern, message);
  },

  throws(fn, message = 'Expected function to throw') {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new AssertionError(message, false, true);
    }
  },

  doesNotThrow(fn, message = 'Expected function not to throw') {
    try {
      const res = fn();
      if (res && typeof res.then === 'function') {
        return res.catch((err) => {
          throw new AssertionError(`${message}: Threw error ${err.message}`, err, null);
        });
      }
    } catch (err) {
      throw new AssertionError(`${message}: Threw error ${err.message}`, err, null);
    }
  },

  // Project Contract Assertions
  lexiconEntry(entry, message = 'Invalid Lexicon Entry structure') {
    assert.ok(entry && typeof entry === 'object', `${message}: must be an object`);
    assert.ok(typeof entry.word === 'string' && entry.word.trim().length > 0, `${message}: word required`);
    assert.ok(typeof entry.pos === 'string', `${message}: pos required`);
    assert.includes(['A1', 'A2', 'B1', 'B2'], entry.cefr, `${message}: invalid CEFR level "${entry.cefr}"`);
    assert.ok(typeof entry.arabic === 'string', `${message}: arabic translation required`);
    assert.ok(typeof entry.example === 'string', `${message}: example sentence required`);
    assert.ok(typeof entry.ipa === 'string', `${message}: ipa pronunciation required`);
  },

  speechScore(res, message = 'Invalid speech evaluation result') {
    assert.ok(res && typeof res === 'object', `${message}: must be object`);
    assert.isNumber(res.score, `${message}: score must be number`);
    assert.ok(res.score >= 0 && res.score <= 100, `${message}: score must be 0-100`);
    assert.ok(Array.isArray(res.wordBreakdown), `${message}: wordBreakdown must be array`);
  },

  ltrIsolation(cssOrHtmlContent, message = 'Missing LTR isolation CSS rules') {
    const hasDirLTR = cssOrHtmlContent.includes('direction: ltr') || cssOrHtmlContent.includes('dir="ltr"');
    const hasIsolate = cssOrHtmlContent.includes('unicode-bidi: isolate') || cssOrHtmlContent.includes('isolate');
    assert.ok(hasDirLTR && hasIsolate, message || 'Content must specify direction: ltr and unicode-bidi: isolate');
  },

  distArtifacts(distPath, message = 'Invalid dist build artifacts') {
    assert.ok(fs.existsSync(distPath), `${message}: Directory does not exist: ${distPath}`);
    const htmlPath = path.join(distPath, 'index.html');
    assert.ok(fs.existsSync(htmlPath), `${message}: index.html missing in dist`);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    assert.matches(htmlContent, /<div\s+id="root">\s*<\/div>/i, `${message}: root div missing`);
    assert.includes(htmlContent, 'assets/', `${message}: asset paths must be present`);
  }
};

export default assert;
