import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { SCENARIOS, FAULTS, classifyProbe, comparable, validateExecution } from './validation.mjs';
import { copyProject, materializeCheckpoint } from './workspaces.mjs';
import { injectCiFailure } from './ci-contract.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);
const args = process.argv.slice(2);
const command = args.shift() || 'help';
function flag(name, fallback, list = args) { const i = list.indexOf(`--${name}`); return i < 0 ? fallback : list[i + 1]; }
function numberFlag(name, fallback) { const value = Number(flag(name, fallback)); if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error(`--${name}: wymagana liczba 1–100`); return value; }
const json = async file => JSON.parse(await readFile(file, 'utf8'));
async function save(file, value) { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(value, null, 2) + '\n'); }
const safe = value => String(value).replace(/[^a-zA-Z0-9_.-]/g, '-');
const stamp = () => `${new Date().toISOString().replaceAll(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
const relative = file => path.relative(ROOT, file).replaceAll('\\', '/');
let server;
let baseURL;
let executionRoot = ROOT;
const controlToken = randomUUID();

async function serve() {
  if (server) return;
  const { createServer } = await import('../app/server.mjs');
  server = createServer({ controlToken });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  baseURL = `http://127.0.0.1:${server.address().port}`;
}

async function environment(options = {}) {
  const pkg = await json('package.json');
  const browserInfo = await json('node_modules/playwright-core/browsers.json');
  const git = (...gitArgs) => {
    const r = spawnSync('git', ['-c', `safe.directory=${ROOT.replaceAll('\\', '/')}`, ...gitArgs], { encoding: 'utf8', cwd: ROOT, windowsHide: true });
    return r.status === 0 ? r.stdout.trim() : null;
  };
  return {
    capturedAt: new Date().toISOString(), commit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain'),
    node: process.version, playwright: pkg.devDependencies['@playwright/test'],
    chromium: browserInfo.browsers.find(b => b.name === 'chromium').browserVersion,
    platform: os.platform(), release: os.release(), arch: os.arch(),
    profile: options.profile || flag('profile', 'normal'), seed: flag('seed', 'testwarez-2026'),
    workers: options.workers || numberFlag('workers', 1), repeat: options.repeat || 1, retries: 0,
    scenarioIdsExpected: options.ids || SCENARIOS,
    checkpoint: (await json(path.join(options.root || ROOT, 'workshop/state.json'))).checkpoint,
  };
}

async function manifestCheck(root = ROOT) {
  const manifest = await json(path.join(root, 'workshop/scenarios.json'));
  if (!Array.isArray(manifest) || manifest.length !== 8 || SCENARIOS.some(id => manifest.filter(s => s.id === id).length !== 1)) throw new Error('Manifest musi mieć dokładnie po jednej aktywnej implementacji SC-01–SC-08');
  for (const entry of manifest) {
    if (!['legacy', 'refactored'].includes(entry.implementation) || !Array.isArray(entry.prerequisites)) throw new Error(`Nieprawidłowy wpis ${entry.id}`);
    if (!/^tests\/(legacy|refactored)\/[^/]+\.spec\.ts$/.test(entry.file)) throw new Error(`Plik poza discovery: ${entry.file}`);
    const source = await readFile(path.join(root, entry.file), 'utf8');
    if (!source.includes(`[${entry.id}] [${entry.implementation}]`)) throw new Error(`Brak aktywnego testu ${entry.id} w ${entry.file}`);
    if (entry.prerequisites.some(id => !SCENARIOS.includes(id))) throw new Error(`Nieznany prerequisite ${entry.id}`);
  }
  return manifest;
}

async function run({ ids = SCENARIOS, profile = flag('profile', 'normal'), fault = null, workers = numberFlag('workers', 1), repeat = 1, label = 'current', smoke = false, prerequisites = false, root = executionRoot } = {}) {
  await serve();
  const manifest = await manifestCheck(root);
  if (prerequisites) ids = [...new Set(ids.flatMap(id => [...manifest.find(s => s.id === id).prerequisites, id]))];
  const dir = path.join(ROOT, 'evidence/runs', `${stamp()}-${safe(label)}`);
  await mkdir(dir, { recursive: true });
  const env = { ...process.env, QC_BASE_URL: baseURL, QC_EXTERNAL_SERVER: '1', QC_CONTROL_TOKEN: controlToken,
    QC_PROFILE: profile, QC_FAULT: fault || '', QC_SEED: flag('seed', 'testwarez-2026'), QC_RUN_ID: randomUUID(),
    QC_REPORT_FILE: path.join(dir, 'results.json'), QC_OUTPUT_DIR: path.join(dir, 'traces'), QC_HTML_DIR: path.join(dir, 'html'), QC_SMOKE: smoke ? '1' : '0' };
  const cli = path.join(ROOT, 'node_modules/@playwright/test/cli.js');
  const cliArgs = [cli, 'test', '--config', path.join(root, 'playwright.config.ts'), '--workers', String(workers), '--repeat-each', String(repeat), '--retries', '0', '--forbid-only'];
  if (!smoke) cliArgs.push('--grep', ids.map(id => `\\[${id}\\]`).join('|'));
  const started = performance.now();
  let output = '';
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, cliArgs, { cwd: root, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => { output += chunk; if (args.includes('--verbose')) process.stdout.write(chunk); });
    child.stderr.on('data', chunk => { output += chunk; if (args.includes('--verbose')) process.stderr.write(chunk); });
    child.on('error', reject); child.on('close', code => resolve(code ?? 2));
  });
  await writeFile(path.join(dir, 'runner.log'), output);
  let report;
  try { report = await json(path.join(dir, 'results.json')); } catch { report = undefined; }
  const problems = smoke ? (!report?.results?.length || report.status !== 'passed' || report.globalErrors?.length || report.results.some(r => r.status !== 'passed' || r.expectedStatus !== 'passed' || r.retry !== 0) ? ['Smoke nie wykonał testu poprawnie'] : []) : validateExecution(report, manifest, ids, repeat);
  const metadata = await environment({ ids: smoke ? [] : ids, profile, workers, repeat, root });
  const observed = [...new Set(report?.results.map(r => r.workerIndex) || [])];
  const summary = { ...metadata, exitCode, passed: exitCode === 0 && problems.length === 0, problems, durationMs: performance.now() - started, observedWorkers: observed,
    scenarioIdsExecuted: [...new Set(report?.results.map(r => r.id).filter(Boolean) || [])], runId: env.QC_RUN_ID, directory: relative(dir), report: relative(path.join(dir, 'results.json')) };
  await save(path.join(dir, 'environment.json'), metadata);
  await save(path.join(dir, 'summary.json'), summary);
  await mkdir('evidence/latest', { recursive: true });
  await save('evidence/latest/run.json', summary);
  if (report) await save('evidence/latest/results.json', report);
  console.log(`${label}: ${summary.passed ? 'PASSED' : 'FAILED'}; ${smoke ? 'smoke' : ids.join(', ')}; profile=${profile}; ${Math.round(summary.durationMs)} ms; ${relative(dir)}`);
  if (!summary.passed && !fault && !args.includes('--quiet')) console.error(output.slice(-6500));
  return { ...summary, dir, reportData: report, manifest };
}

async function probe(scenario = flag('scenario', 'SC-04'), fault = flag('fault', 'F-01'), options = {}) {
  if (FAULTS[fault]?.scenario !== scenario) throw new Error('Para defekt/scenariusz: F-01/SC-04, F-02/SC-06, F-03/SC-07, F-04/SC-08');
  const normal = await run({ ...options, ids: [scenario], fault: null, prerequisites: true, label: `${scenario}-normal` });
  const faulty = await run({ ...options, ids: [scenario], fault, prerequisites: true, label: `${scenario}-${fault}` });
  const faultyInventory = faulty.reportData ? {
    ...faulty.reportData,
    results: faulty.reportData.results.map(r => r.id === scenario && r.status === 'failed' ? { ...r, status: 'passed' } : r),
  } : undefined;
  const faultyInventoryProblems = validateExecution(faultyInventory, faulty.manifest, normal.scenarioIdsExpected);
  const classification = classifyProbe({ normal: normal.reportData, faulty: faulty.reportData, normalProblems: normal.problems, faultyInventoryProblems, normalExitCode: normal.exitCode, faultyExitCode: faulty.exitCode, scenario, fault });
  const report = { ...classification, scenario, fault, normal: relative(normal.dir), faulty: relative(faulty.dir) };
  const target = path.join(ROOT, 'evidence/probes', `${stamp()}-${fault}.json`);
  await save(target, report);
  console.log(`${fault}: ${classification.status}; ${relative(target)}`);
  return report;
}

async function materialize(name, destination, { dependencies = false } = {}) {
  const target = await materializeCheckpoint(ROOT, name, destination, { dependencies });
  await manifestCheck(target);
  return target;
}

async function matrix({ root = executionRoot, full = false } = {}) {
  const repeats = numberFlag('repeat', 5);
  const runs = [];
  for (const profile of ['normal', 'slow-coupon', 'layout-shift', 'combined']) {
    runs.push(await run({ root, ids: full ? SCENARIOS : ['SC-03', 'SC-04'], profile, repeat: repeats, label: `matrix-${profile}` }));
  }
  const report = { passed: runs.every(r => r.passed), runs: runs.map(({ reportData, manifest, ...r }) => r) };
  await save(`evidence/matrix/${stamp()}.json`, report);
  return report.passed;
}

async function isolation() {
  const runs = [];
  // These are real separate execution plans. Playwright has no --reverse flag.
  for (const order of [SCENARIOS, [...SCENARIOS].reverse()]) {
    for (const id of order) runs.push(await run({ ids: [id], label: `isolation-${id}` }));
  }
  const concurrent = await run({ workers: numberFlag('workers', 4), repeat: numberFlag('repeat', 5), label: 'isolation-concurrent' });
  const executions = concurrent.reportData?.results || [];
  const validAttachments = executions.length > 0 && executions.every(r => {
    const created = r.attachments.filter(a => a.name === 'workspace.json');
    const lifecycle = r.attachments.filter(a => a.name === 'workspace-lifecycle.json');
    const cleanup = r.attachments.filter(a => a.name === 'cleanup.json');
    return created.length === 1 && typeof created[0].data?.workspaceId === 'string' && lifecycle.length === 1 && cleanup.length === 1 && cleanup[0].data?.deleted === true;
  });
  const workspaces = executions.flatMap(r => r.attachments.filter(a => a.name === 'workspace.json').map(a => a.data?.workspaceId));
  const intervals = executions.flatMap(r => r.attachments.filter(a => a.name === 'workspace-lifecycle.json').map(a => [Date.parse(a.data.useStartedAt), Date.parse(a.data.useEndedAt), r.workerIndex]));
  const overlap = intervals.some((a, i) => intervals.some((b, j) => i < j && a[2] !== b[2] && a[0] < b[1] && b[0] < a[1]));
  const passed = runs.every(r => r.passed) && concurrent.passed && validAttachments && new Set(workspaces).size === workspaces.length && overlap;
  await save(`evidence/isolation/${stamp()}.json`, { passed, distinctWorkspaces: new Set(workspaces).size, executions: workspaces.length, overlap, runs: runs.map(r => relative(r.dir)), concurrent: relative(concurrent.dir) });
  return passed;
}

async function baseline() {
  const action = args[0];
  if (action === 'capture') {
    const label = flag('label', 'before');
    if (!/^[\w-]+$/.test(label)) throw new Error('Label: litery, cyfry, _ i -');
    const target = path.join(ROOT, 'evidence', label);
    if (existsSync(path.join(target, 'baseline.json'))) throw new Error(`Baseline ${label} już istnieje; wybierz nową etykietę.`);
    const repetitions = numberFlag('repetitions', 5);
    const checkpoint = flag('checkpoint');
    const root = checkpoint ? await materialize(checkpoint, `.workshop-tmp/baseline-${stamp()}`, { dependencies: true }) : ROOT;
    const warmup = await run({ root, label: `${label}-warmup` });
    const trials = [];
    for (let i = 0; i < repetitions; i++) trials.push(await run({ root, label: `${label}-${i + 1}` }));
    const summarize = ({ reportData, manifest, ...r }) => r;
    await save(path.join(target, 'baseline.json'), { conditions: await environment({ root }), warmup: summarize(warmup), trials: trials.map(summarize) });
    console.log(`Baseline: ${relative(target)} (rozgrzewka osobno, wszystkie próby zachowane).`);
    return trials.every(r => r.passed);
  }
  if (action === 'compare') {
    const before = await json(path.join(path.resolve(flag('before', 'evidence/before')), 'baseline.json'));
    const after = await json(path.join(path.resolve(flag('after', 'evidence/after')), 'baseline.json'));
    const differences = comparable(before.conditions, after.conditions);
    const stats = baseline => {
      const durations = baseline.trials.filter(t => t.passed).map(t => t.durationMs).sort((a, b) => a - b);
      return { trials: baseline.trials.length, passed: durations.length, failed: baseline.trials.length - durations.length, durationsMsAll: baseline.trials.map(t => t.durationMs), medianSuccessfulMs: durations.length ? durations[Math.floor(durations.length / 2)] : null };
    };
    const report = { comparable: differences.length === 0, differences, before: stats(before), after: stats(after), note: 'Mała próba nie dowodzi zerowej niestabilności. Czasy obejmują start runnera. Zmiana setupu wymaga interpretacji.' };
    await save(`evidence/comparisons/${stamp()}.json`, report); console.log(JSON.stringify(report, null, 2));
    return differences.length === 0;
  }
  throw new Error('baseline capture --label before --repetitions 5 | compare --before evidence/before --after evidence/after');
}

async function demo() {
  await serve();
  const control = async (url, method = 'GET', body) => {
    const r = await fetch(baseURL + url, { method, headers: { 'content-type': 'application/json', 'x-qc-control': controlToken }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error(`Demo control HTTP ${r.status}`);
    return r.status === 204 ? null : r.json();
  };
  const ws = await control('/__control/workspaces', 'POST', { profile: 'gated-demo', runId: randomUUID() });
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  try {
    await context.addCookies([{ name: 'qc_workspace', value: ws.id, url: baseURL }]);
    await context.request.post('/api/login', { data: ws.user });
    for (const item of [{ sku: 'BOOK-100', quantity: 2 }, { sku: 'MUG-050', quantity: 1 }]) await context.request.post('/api/cart/items', { data: item });
    const page = await context.newPage(); await page.goto('/');
    await page.getByTestId('coupon-code').fill('SAVE10'); await page.getByTestId('coupon-apply').click();
    const { expect } = await import('@playwright/test');
    await expect(page.getByTestId('coupon-status')).toHaveText('Przeliczanie');
    const pending = await control(`/__control/workspaces/${ws.id}`);
    const prematureTotal = await page.getByTestId('cart-total').textContent();
    if (prematureTotal !== '250,00 zł' || !pending.gateClosed || !pending.events.some(e => e.type === 'coupon:pending')) throw new Error('Brak dowodu zamkniętej bariery i przedwczesnego odczytu');
    await control(`/__control/workspaces/${ws.id}/release`, 'POST');
    await expect(page.getByTestId('cart-total')).toHaveText('225,00 zł');
    await save(`evidence/demo/${stamp()}.json`, { workspaceId: ws.id, pending, prematureTotal, finalTotal: await page.getByTestId('cart-total').textContent() });
    console.log('Bariera: pending / przedwczesny odczyt 250,00 zł / po zwolnieniu 225,00 zł.');
    return true;
  } finally {
    try { await control(`/__control/workspaces/${ws.id}/release`, 'POST'); }
    finally { try { await control(`/__control/workspaces/${ws.id}`, 'DELETE'); } finally { await browser.close(); } }
  }
}

async function doctor() {
  const problems = [];
  if (!/^v2[46]\./.test(process.version)) problems.push('Użyj Node.js 24 lub 26');
  const pkg = await json('package.json');
  const lock = await json('package-lock.json');
  for (const [name, version] of Object.entries(pkg.devDependencies)) {
    const installed = await json(path.join('node_modules', name, 'package.json'));
    if (installed.version !== version || lock.packages[''].devDependencies[name] !== version) problems.push(`Niezgodna wersja ${name}; wykonaj npm ci`);
  }
  try { await access(chromium.executablePath()); } catch { problems.push('Brak Chromium. Wykonaj npx playwright install chromium'); }
  await manifestCheck(); await serve();
  const health = await fetch(`${baseURL}/healthz`).then(r => r.json());
  if (health.app !== 'qualitycart') problems.push('Nieprawidłowe /healthz');
  let browserVersion;
  if (!problems.length) { const browser = await chromium.launch(); try { browserVersion = browser.version(); } finally { await browser.close(); } }
  await save('evidence/LAB-00/environment.json', { ...await environment(), health, browserVersion, problems });
  console.log(problems.length ? problems.join('\n') : `Doctor OK: ${process.version}, Chromium ${browserVersion}, lokalny serwer, 8 ID.`);
  return problems.length === 0;
}

async function migration() {
  const results = [];
  for (const stage of ['after-lab05', 'after-lab06']) {
    const root = await materialize(stage, `.workshop-tmp/migration-${stage}-${stamp()}`, { dependencies: true });
    results.push(await run({ root, ids: ['SC-04'], label: `migration-${stage}` }));
    results.push(await probe('SC-04', 'F-01', { root }));
  }
  const passed = results.every(r => r.passed ?? r.exitCode === 0);
  await save(`evidence/migration/${stamp()}.json`, { passed, executions: results.map(r => r.directory || r) });
  return passed;
}

function applyKnownDiff(root, filename) {
  const options = ['-c', `safe.directory=${ROOT.replaceAll('\\', '/')}`, 'apply', '--whitespace=nowarn', `--directory=${relative(root)}`];
  for (const check of [true, false]) {
    const result = spawnSync('git', [...options, ...(check ? ['--check'] : []), path.join(ROOT, 'docs/ai', filename)], { cwd: ROOT, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0) throw new Error(`Nie można zastosować ${filename}: ${result.stderr || result.error}`);
  }
}

async function aiContract() {
  const outcomes = [];
  for (const [variant, expected] of [['unsafe-refactor.diff', 'MISSING_DETECTION'], ['safe-small-refactor.diff', 'DETECTED']]) {
    const root = await materialize('after-lab06', `.workshop-tmp/ai-${safe(variant)}-${stamp()}`, { dependencies: true });
    applyKnownDiff(root, variant);
    const result = await probe('SC-04', 'F-01', { root });
    outcomes.push({ variant, expected, actual: result.status, passed: result.status === expected, report: result });
  }
  const passed = outcomes.every(r => r.passed);
  await save(`evidence/ai/${stamp()}.json`, { passed, outcomes, note: 'Oba znane diffy wykonano na oddzielnych kopiach after-lab06. Retry runnera pozostaje 0.' });
  return passed;
}

async function starterContract() {
  const root = await materialize('start', `.workshop-tmp/starter-${stamp()}`, { dependencies: true });
  const normal = await run({ root, label: 'starter-normal' });
  const solo = await run({ root, ids: ['SC-04'], label: 'starter-solo', fault: null });
  const shifted = await run({ root, ids: ['SC-03', 'SC-04'], profile: 'layout-shift', label: 'starter-layout' });
  const soloResult = solo.reportData?.results;
  const layoutResult = shifted.reportData?.results;
  const soloConfirmed = solo.exitCode === 1 && !solo.reportData?.globalErrors?.length && soloResult?.length === 1 && soloResult[0].status === 'failed' && soloResult[0].errors.some(e => e.message.includes('ORACLE:SC04-TOTAL') && e.message.includes('225,00 zł') && e.message.includes('0,00 zł'));
  const wrongCart = layoutResult?.find(r => r.id === 'SC-03')?.attachments.find(a => a.name === 'control-events.json')?.data?.cart;
  const layoutConfirmed = shifted.exitCode === 1 && !shifted.reportData?.globalErrors?.length && layoutResult?.length === 2 && layoutResult.find(r => r.id === 'SC-03')?.status === 'failed' && layoutResult.find(r => r.id === 'SC-04')?.status === 'skipped' && layoutResult.find(r => r.id === 'SC-03')?.errors.some(e => e.message.includes('toHaveValue') && e.message.includes('cart-quantity-BOOK-100') && e.message.includes('element(s) not found')) && wrongCart?.items?.length === 1 && wrongCart.items[0].sku === 'MUG-050' && wrongCart.items[0].quantity === 1;
  const passed = normal.passed && soloConfirmed && layoutConfirmed && await demo();
  await save(`evidence/starter-contract/${stamp()}.json`, { passed, normal: relative(normal.dir), solo: relative(solo.dir), shifted: relative(shifted.dir), soloConfirmed, layoutConfirmed, note: 'Tylko te konkretne symptomy są oczekiwanymi awariami dydaktycznymi. Normalny zestaw musi przejść.' });
  return passed;
}

async function ciContract({ baseline } = {}) {
  baseline ??= await run({ label: 'ci-contract-baseline' });
  if (!baseline.passed) {
    await save(`evidence/ci-contract/${stamp()}.json`, { passed: false, baseline: relative(baseline.dir), outcomes: [], note: 'Bieżący zestaw nie przechodzi. Najpierw napraw baseline; nie zaliczono prób odrzucenia wadliwego kodu.' });
    return false;
  }
  const outcomes = [];
  for (const variant of ['only', 'assertion']) {
    const root = await copyProject(executionRoot, path.join(ROOT, `.workshop-tmp/ci-${variant}-${stamp()}`), { dependencies: true });
    const manifest = await manifestCheck(root);
    const file = path.join(root, manifest.find(entry => entry.id === 'SC-01').file);
    await writeFile(file, injectCiFailure(await readFile(file, 'utf8'), variant));
    const runResult = await run({ root, label: `ci-contract-${variant}` });
    const proven = runResult.exitCode === 1 && (variant === 'only' ? runResult.reportData?.globalErrors.some(e => /only.*forbid|forbid.*only/i.test(e.message || '')) : runResult.reportData?.results.some(r => r.id === 'SC-01' && r.status === 'failed' && r.errors.some(e => e.message.includes('CI-CONTRACT: deliberate failure'))));
    outcomes.push({ variant, rejected: proven, directory: relative(runResult.dir) });
  }
  const passed = outcomes.every(r => r.rejected);
  await save(`evidence/ci-contract/${stamp()}.json`, { passed, outcomes, note: 'Celowe zmiany powstały wyłącznie na kopiach bieżącego kodu. Nie użyto checkpointów referencyjnych.' });
  return passed;
}

async function verifyLab(lab) {
  if (!/^LAB-0[0-8]$/.test(lab)) throw new Error('Podaj LAB-00–LAB-08');
  let passed;
  if (lab === 'LAB-00') passed = await doctor() && (await run({ smoke: true, label: 'smoke' })).passed && (await run()).passed;
  else if (lab === 'LAB-03') passed = await matrix() && (await probe()).exitCode === 0;
  else if (lab === 'LAB-04') passed = await isolation() && (await probe()).exitCode === 0;
  else if (lab === 'LAB-05') passed = (await run()).passed && (await probe('SC-06', 'F-02')).exitCode === 0;
  else if (lab === 'LAB-06') {
    const current = await run();
    const migrated = current.manifest.find(entry => entry.id === 'SC-04').implementation === 'refactored';
    if (!migrated) console.error('LAB-06: manifest musi aktywować nową implementację refactored dla SC-04.');
    passed = current.passed && migrated && (await probe()).exitCode === 0 && await ciContract({ baseline: current });
  }
  else if (lab === 'LAB-07') passed = (await run()).passed && (await probe()).exitCode === 0;
  else if (lab === 'LAB-08') passed = (await run({ ids: ['SC-07'] })).passed && (await probe('SC-07', 'F-03')).exitCode === 0 && (await run()).passed;
  else if (lab === 'LAB-01') { await manifestCheck(); passed = (await run()).passed; }
  else passed = (await run()).passed && (await probe()).exitCode === 0;
  await save(`evidence/labs/${lab}-${stamp()}.json`, { lab, automatedChecksPassed: passed, sourceDirectory: relative(executionRoot) || '.', note: 'Sprawdzono bieżący kod. Warunki pisemne, dowody przed/po, review diffów AI i peer review ocenia człowiek według karty LAB.' });
  return passed;
}

async function main() {
  if (command === 'report') {
    const latest = await json('evidence/latest/run.json');
    const folder = path.join(ROOT, latest.directory, 'html');
    await access(path.join(folder, 'index.html'));
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [path.join(ROOT, 'node_modules/@playwright/test/cli.js'), 'show-report', folder], { stdio: 'inherit', windowsHide: true });
      child.on('error', reject); child.on('close', code => resolve(code === 0));
    });
  }
  if (command === 'doctor') return doctor();
  if (command === 'manifest') { await manifestCheck(); console.log('Manifest: osiem ID, pliki i implementacje zgodne. Uruchomienie testów sprawdza faktyczne wykonanie.'); return true; }
  if (command === 'current' || command === 'smoke') return (await run({ ids: flag('scenario', '').split(',').filter(Boolean).length ? flag('scenario').split(',') : SCENARIOS, repeat: numberFlag('repeat', 1), smoke: command === 'smoke', label: command })).passed;
  if (command === 'probe') return (await probe()).exitCode;
  if (command === 'matrix') return matrix({ full: args.includes('--full') });
  if (command === 'baseline') return baseline();
  if (command === 'demo') return demo();
  if (command === 'migration') return migration();
  if (command === 'starter-contract') return starterContract();
  if (command === 'ci-contract') return ciContract();
  if (command === 'ai-reference') return aiContract();
  if (command === 'lab') {
    if (args[0] === 'list') { console.log((await json('checkpoints/catalog.json')).order.join('\n')); return true; }
    if (args[0] === 'checkpoint') {
      const destination = flag('dest'); if (!destination) throw new Error('Podaj --dest <nowy katalog>, np. ../qualitycart-lab04');
      const target = await materialize(args[1], destination); console.log(`Checkpoint gotowy: ${target}\nW nowym katalogu: npm ci; npm run doctor`); return true;
    }
    if (args[0] === 'verify') {
      if (flag('checkpoint')) executionRoot = await materialize(flag('checkpoint'), `.workshop-tmp/verify-${stamp()}`, { dependencies: true });
      return verifyLab(args[1]);
    }
  }
  if (command === 'release') {
    const root = await materialize('reference-final', `.workshop-tmp/release-${stamp()}`, { dependencies: true });
    let passed = await matrix({ root, full: true });
    for (const [fault, value] of Object.entries(FAULTS)) if ((await probe(value.scenario, fault, { root })).exitCode !== 0) passed = false;
    await save(`evidence/release/${stamp()}.json`, { passed, checkpoint: 'reference-final', sourceDirectory: relative(root) });
    return passed;
  }
  console.log('doctor | current | smoke | manifest | probe --scenario SC-04 --fault F-01 | matrix --repeat 5 | baseline capture/compare | demo | lab list/checkpoint/verify | release');
  return command === 'help';
}

try {
  const result = await main(); process.exitCode = typeof result === 'number' ? result : result ? 0 : 1;
} catch (error) { console.error(error.stack || error); process.exitCode = 2; }
finally { if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } }
