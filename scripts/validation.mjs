export const SCENARIOS = Array.from({ length: 8 }, (_, i) => `SC-${String(i + 1).padStart(2, '0')}`);
export const FAULTS = {
  'F-01': { scenario: 'SC-04', oracles: ['ORACLE:SC04-TOTAL', 'ORACLE:SC04-DISCOUNT'] },
  'F-02': { scenario: 'SC-06', oracles: ['ORACLE:SC06-REMOVED', 'ORACLE:SC06-TOTAL'] },
  'F-03': { scenario: 'SC-07', oracles: ['ORACLE:SC07-TOTAL'] },
  'F-04': { scenario: 'SC-08', oracles: ['ORACLE:SC08-QUANTITY'] },
};

export function validateExecution(report, manifest, ids, repeat = 1) {
  const problems = [];
  if (!report || report.globalErrors?.length) return ['ENVIRONMENT_ERROR: brak raportu lub błąd runnera'];
  for (const id of ids) {
    const entry = manifest.find(s => s.id === id);
    const results = report.results.filter(r => r.id === id);
    if (results.length !== repeat) problems.push(`${id}: wykonano ${results.length}, oczekiwano ${repeat}`);
    for (const r of results) {
      if (!entry || r.implementation !== entry.implementation || r.file !== entry.file) problems.push(`${id}: inna implementacja niż aktywna w manifeście`);
      if (r.status !== 'passed' || r.expectedStatus !== 'passed' || r.retry !== 0) problems.push(`${id}: ${r.status}, expected=${r.expectedStatus}, retry=${r.retry}`);
    }
  }
  for (const r of report.results) if (!ids.includes(r.id)) problems.push(`Nieoczekiwany test ${r.title}`);
  return problems;
}

function walk(value, predicate) {
  if (!value || typeof value !== 'object') return false;
  if (predicate(value)) return true;
  return Object.values(value).some(v => walk(v, predicate));
}

export function classifyProbe({ normal, faulty, scenario, fault, normalProblems = [], faultyInventoryProblems = [], normalExitCode, faultyExitCode }) {
  const contract = FAULTS[fault];
  if (!contract || scenario !== contract.scenario) throw new Error('Nieprawidłowa para scenariusz/defekt');
  if (!normal || !faulty || normalExitCode === 2 || faultyExitCode === 2 || normal.globalErrors?.length || faulty.globalErrors?.length ||
      [...(normal.results || []), ...(faulty.results || [])].some(r => r.errors?.some(e => /browserType\.launch|Executable doesn't exist|ECONNREFUSED|CREATE_WORKSPACE|SETUP_LOGIN|INSPECT_WORKSPACE/.test(e.message || '')))) {
    return { status: 'ENVIRONMENT_ERROR', exitCode: 2 };
  }
  if (normalProblems.length || normal.status !== 'passed' || (normalExitCode !== undefined && normalExitCode !== 0)) return { status: 'BASELINE_FAILED', exitCode: 1, problems: normalProblems };
  if (faultyInventoryProblems.length) return { status: 'WRONG_FAILURE', exitCode: 1, problems: faultyInventoryProblems };
  const targets = faulty.results.filter(r => r.id === scenario);
  const activated = targets.some(r => r.attachments.some(a => walk(a.data, v => v.type === 'fault:activated' && v.fault === fault)));
  if (!activated || targets.length !== 1) return { status: 'WRONG_FAILURE', exitCode: 1, activated, reason: 'Brak dokładnie jednego wykonania i potwierdzonej aktywacji defektu' };
  const target = targets[0];
  if (target.status === 'passed' && faulty.status === 'passed') return { status: 'MISSING_DETECTION', exitCode: 1, activated };
  const oracleErrors = target.errors.filter(e => contract.oracles.some(marker => e.message?.includes(marker)));
  const otherFailures = faulty.results.filter(r => r !== target && r.status !== 'passed');
  if (target.status === 'failed' && (faultyExitCode === undefined || faultyExitCode === 1) && target.expectedStatus === 'passed' && target.retry === 0 &&
      oracleErrors.length > 0 && oracleErrors.length === target.errors.length && otherFailures.length === 0 &&
      oracleErrors.every(e => /Expected|expected|Received|received/.test(e.message || ''))) {
    return { status: 'DETECTED', exitCode: 0, activated, oracleErrors };
  }
  return { status: 'WRONG_FAILURE', exitCode: 1, activated, errors: target.errors };
}

export function comparable(before, after) {
  const keys = ['scenarioIdsExpected', 'profile', 'seed', 'node', 'playwright', 'chromium', 'platform', 'release', 'arch', 'workers', 'repeat', 'retries'];
  return keys.filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]));
}
