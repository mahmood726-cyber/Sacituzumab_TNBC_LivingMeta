#!/usr/bin/env node
/* sentinel:skip-file — this is the integrity test itself; it contains placeholder-detector
   literals (REPLACE_ME, __PLACEHOLDER__) and a hardcoded-path regex by design, not as shipped data. */
/*
 * smoke_test.js — minimal structural integrity smoke test for the
 * Sacituzumab/TNBC living meta-analysis dashboard (offline single-file HTML app).
 *
 * Run:  node smoke_test.js
 * Exit: 0 = all checks pass, 1 = at least one failure.
 *
 * Checks (no network, no browser, pure Node):
 *   1. Shipped files exist.
 *   2. No UTF-8 BOM at the head of HTML/JS assets.
 *   3. No hardcoded local paths (C:\Users... / /home/<user>) in shipped assets.
 *   4. Main dashboard <script> open/close tags are balanced.
 *   5. Every inline (non-src) JS <script> block parses.
 *   6. Every asset JS file parses.
 *   7. No unfilled template tokens ({{...}}, REPLACE_ME, __PLACEHOLDER__).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const MAIN = path.join(ROOT, 'SACITUZUMAB_TNBC_REVIEW.html');
const INDEX = path.join(ROOT, 'index.html');

let failures = 0;
function ok(msg) { console.log('  ok   - ' + msg); }
function fail(msg) { console.log('  FAIL - ' + msg); failures++; }
function check(cond, msg) { cond ? ok(msg) : fail(msg); }

// 1. files exist
['SACITUZUMAB_TNBC_REVIEW.html', 'index.html', 'README.md'].forEach(function (f) {
  check(fs.existsSync(path.join(ROOT, f)), 'exists: ' + f);
});

function listAssetJs() {
  const out = [];
  ['assets/js', 'assets/vendor'].forEach(function (d) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(function (f) {
      if (f.endsWith('.js') && !f.endsWith('.min.js')) out.push(path.join(dir, f));
    });
  });
  return out;
}

const htmlFiles = [MAIN, INDEX];
const jsFiles = listAssetJs();

// 2. no BOM
htmlFiles.concat(jsFiles).forEach(function (f) {
  const buf = fs.readFileSync(f);
  const hasBom = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  check(!hasBom, 'no BOM: ' + path.relative(ROOT, f));
});

// 3. no hardcoded local paths in shipped assets
const PATH_RE = /C:\\Users|\/home\/[a-z]/;
htmlFiles.concat(jsFiles).forEach(function (f) {
  const txt = fs.readFileSync(f, 'utf8');
  check(!PATH_RE.test(txt), 'no hardcoded local path: ' + path.relative(ROOT, f));
});

// 4. main dashboard script tag balance
const mainHtml = fs.readFileSync(MAIN, 'utf8');
const so = (mainHtml.match(/<script[\s>]/g) || []).length;
const sc = (mainHtml.match(/<\/script>/g) || []).length;
check(so === sc, 'balanced <script> tags in main dashboard (' + so + ' open / ' + sc + ' close)');

// 5. inline scripts parse
(function () {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m, n = 0, bad = 0;
  while ((m = re.exec(mainHtml))) {
    const attrs = m[1] || '';
    if (/\bsrc=/.test(attrs)) continue;
    if (/type=/i.test(attrs) && !/javascript|module/i.test(attrs)) continue;
    n++;
    try { new vm.Script(m[2], { filename: 'inline#' + n }); }
    catch (e) { bad++; console.log('       (block#' + n + ': ' + e.message.split('\n')[0] + ')'); }
  }
  check(bad === 0, 'all ' + n + ' inline scripts parse');
})();

// 6. asset js parse
jsFiles.forEach(function (f) {
  try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f }); ok('parses: ' + path.relative(ROOT, f)); }
  catch (e) { fail('parses: ' + path.relative(ROOT, f) + ' :: ' + e.message.split('\n')[0]); }
});

// 7. no unfilled template tokens
const TOKEN_RE = /\{\{[^}]+\}\}|REPLACE_ME|__PLACEHOLDER__/;
htmlFiles.forEach(function (f) {
  check(!TOKEN_RE.test(fs.readFileSync(f, 'utf8')), 'no unfilled template tokens: ' + path.relative(ROOT, f));
});

console.log('');
if (failures === 0) { console.log('SMOKE PASS — all checks green'); process.exit(0); }
console.log('SMOKE FAIL — ' + failures + ' check(s) failed'); process.exit(1);
