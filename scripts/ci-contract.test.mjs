import test from 'node:test';
import assert from 'node:assert/strict';
import { injectCiFailure } from './ci-contract.mjs';

test('CI failure injection locates SC-01 without depending on starter formatting or page.goto', () => {
  const source = `customTest( "[SC-01] [refactored] login", { tag: '@login' }, async function ({ page }) {\n  await signIn(page);\n  await page.context().close();\n});`;
  const only = injectCiFailure(source, 'only');
  assert.ok(only.startsWith('customTest.only('));
  assert.ok(only.includes('await signIn(page)'));
  const failure = injectCiFailure(source, 'assertion');
  assert.ok(failure.includes("throw new Error('CI-CONTRACT: deliberate failure');"));
  assert.ok(failure.indexOf('CI-CONTRACT:') < failure.indexOf('await signIn'));
  assert.equal(source.includes('CI-CONTRACT:'), false);
});

test('CI failure injection refuses missing or ambiguous SC-01 instead of crediting an unrelated failure', () => {
  assert.throws(() => injectCiFailure("test('[SC-02]', async () => {});", 'only'), /jednego testu SC-01/);
  const duplicate = "test('[SC-01]', async () => {}); test('[SC-01]', async () => {});";
  assert.throws(() => injectCiFailure(duplicate, 'assertion'), /jednego testu SC-01/);
});
