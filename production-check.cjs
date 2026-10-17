'use strict';
// Validate what will actually be served. Never print suspected secret values.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, 'dist');
const expected = ['game.js', 'index.html', 'style.css'];
function publicFiles(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    assert(!entry.isSymbolicLink(), 'Public assets must not be symbolic links');
    return entry.isDirectory() ? publicFiles(path.join(directory, entry.name), name + '/') : [name];
  });
}
assert.deepEqual(publicFiles(root).sort(), expected, 'Review unexpected public files before deploying');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Unique UI element identifiers');
for (const match of runtime.matchAll(/\$\('([^']+)'\)/g)) assert(ids.includes(match[1]), 'Runtime UI element exists: ' + match[1]);
for (const id of ['yard', 'depot', 'foundry', 'range']) assert(html.includes('value="' + id + '"'), 'Map selector contains ' + id);
assert(!/window\.(?:BREACH|__qa)\s*=|\beval\s*\(/.test(runtime), 'Production must not expose mutation-capable diagnostics');
assert(html.includes('Created and owned by Arkh_53') && html.includes('>Sensitivity <'), 'Menu label and ownership credit');
assert(html.includes('Co-owner Khibanyan'), 'Co-owner credit');
assert(!/stamina|slideCD/.test(runtime) && !/id="stamina"|class="stamina"/.test(html), 'Unlimited movement has no stamina bar, exhaustion or slide cooldown');
assert(!/fetch\s*\(|WebSocket|networkAction|initializeNetworkUI/.test(runtime), 'Single-player release has no multiplayer connections');
assert(!/createParty|joinParty|partyCode|leaderboardButton/.test(html), 'No canceled multiplayer or worldwide-ranking controls');
assert(!/visualFixture|qaControls|QA ONLY/.test(runtime), 'No visual fixture controls in production');
for (const id of ['eventObjective','eventTitle','eventReward','eventDetail','eventProgress','eventMap','eventMarker','adminEvent']) assert(ids.includes(id), 'Event interface exists: '+id);
assert(html.includes('data-admin="refill"')&&html.includes('data-admin="event"'), 'Both admin controls are present');
const objectiveMarkup=html.slice(html.indexOf('<section id="eventObjective"'),html.indexOf('<div id="feed"'));
assert(!/optional|skip|<button/i.test(objectiveMarkup), 'Active objective has no optional label or skip button');
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
for (const ref of references) {
  assert(expected.includes(ref), 'Unexpected or external asset reference');
  assert(fs.statSync(path.join(root, ref)).isFile(), 'Referenced asset must exist');
}
assert(references.includes('game.js') && references.includes('style.css'), 'Game assets must be linked');
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
  /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*['"][^'"\r\n]{8,}['"]/i
];
let bytes = 0;
for (const file of expected) {
  const location = path.join(root, file);
  assert(!fs.lstatSync(location).isSymbolicLink(), 'Public assets must not be symbolic links');
  const data = fs.readFileSync(location, 'utf8');
  bytes += Buffer.byteLength(data);
  assert(!patterns.some(pattern => pattern.test(data)), 'Possible secret in public file: ' + file);
  assert(!/(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?\b/i.test(data), 'Local-only endpoint in public file: ' + file);
}
console.log(JSON.stringify({ productionFiles: expected, bytes, assetReferences: 'passed', secretPatternScan: 'passed', note: 'Pattern scan is not a complete security audit or a Git history scan.' }, null, 2));
