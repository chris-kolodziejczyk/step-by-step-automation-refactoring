import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyProbe, validateExecution, comparable } from './validation.mjs';
const result = (status = 'passed', error) => ({ id: 'SC-04', implementation: 'legacy', file: 'tests/legacy/cart-flow.spec.ts', title: '[SC-04]', status, expectedStatus: 'passed', retry: 0, errors: error ? [{ message: error }] : [], attachments: [{ data: { events: [{ type: 'fault:activated', fault: 'F-01' }] } }] });
const report = (r = result()) => ({ status: r.status === 'passed' ? 'passed' : 'failed', results: [r], globalErrors: [] });
const classify = faulty => classifyProbe({ normal: report(), faulty, scenario: 'SC-04', fault: 'F-01' });
test('probe credits only intended oracle plus activated fault', () => {
  assert.equal(classify(report(result('failed', 'ORACLE:SC04-TOTAL Expected 225,00 zł Received 250,00 zł'))).status, 'DETECTED');
  assert.equal(classify(report()).status, 'MISSING_DETECTION');
  assert.equal(classify(report(result('failed', 'Timeout while clicking button'))).status, 'WRONG_FAILURE');
  assert.equal(classify(report(result('failed', "browserType.launch: Executable doesn't exist"))).status, 'ENVIRONMENT_ERROR');
  const missing = result('failed', 'ORACLE:SC04-TOTAL Expected 225 Received 250'); missing.attachments = [];
  assert.equal(classify(report(missing)).status, 'WRONG_FAILURE');
});
test('a failed normal run never proves fault detection', () => {
  assert.equal(classifyProbe({ normal: report(result('failed', 'oracle')), faulty: report(), scenario: 'SC-04', fault: 'F-01' }).status, 'BASELINE_FAILED');
  assert.equal(classifyProbe({ normal: report(), faulty: report(), normalExitCode: 1, scenario: 'SC-04', fault: 'F-01' }).status, 'BASELINE_FAILED');
  assert.equal(classifyProbe({ normal: report(), faulty: report(result('failed', 'ORACLE:SC04-TOTAL Expected 225 Received 250')), faultyInventoryProblems: ['Inna implementacja'], scenario: 'SC-04', fault: 'F-01' }).status, 'WRONG_FAILURE');
});
test('inventory rejects zero tests, duplicate ids, skipped and wrong implementation', () => {
  const manifest = [{ id: 'SC-04', implementation: 'legacy', file: 'tests/legacy/cart-flow.spec.ts' }];
  assert.deepEqual(validateExecution(report(), manifest, ['SC-04']), []);
  assert.ok(validateExecution({ results: [] }, manifest, ['SC-04']).length);
  assert.ok(validateExecution({ results: [result(), result()] }, manifest, ['SC-04']).length);
  assert.ok(validateExecution(report(result('skipped')), manifest, ['SC-04']).length);
  assert.ok(validateExecution(report({ ...result(), implementation: 'shadow' }), manifest, ['SC-04']).length);
});
test('baseline comparison refuses changed execution conditions', () => {
  assert.deepEqual(comparable({ workers: 1, profile: 'normal' }, { workers: 4, profile: 'normal' }), ['workers']);
});
