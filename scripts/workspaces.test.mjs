import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { copyProject, materializeCheckpoint } from './workspaces.mjs';

async function fixture(t) {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'qualitycart-workspaces-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, 'project');
  async function put(file, value) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, value);
  }
  await put('checkpoints/catalog.json', JSON.stringify({ order: ['start', 'after-lab03'] }));
  await put('checkpoints/start/tests/example.ts', 'starter');
  await put('tests/example.ts', 'participant changes');
  await put('workshop/state.json', '{"checkpoint":"participant"}');
  await put('trainer-private/checkpoints/after-lab03/tests/example.ts', 'private solution');
  await put('docs/helpTR/trainer.md', 'private notes');
  await put('docs/prezentacja/deck.pptx', 'private deck');
  await put('docs/labs/LAB-03.md', 'public task');
  await put('evidence/result.json', 'old report');
  return { root, put };
}

test('a participant snapshot preserves their code and excludes trainer assets and old evidence', async t => {
  const { root } = await fixture(t);
  const target = path.join(root, '.workshop-tmp/snapshot');
  await copyProject(root, target);
  assert.equal(await readFile(path.join(target, 'tests/example.ts'), 'utf8'), 'participant changes');
  assert.equal(await readFile(path.join(target, 'workshop/state.json'), 'utf8'), '{"checkpoint":"participant"}');
  assert.equal(await readFile(path.join(target, 'docs/labs/LAB-03.md'), 'utf8'), 'public task');
  for (const excluded of ['trainer-private', 'docs/helpTR', 'docs/prezentacja', 'evidence', '.workshop-tmp']) {
    await assert.rejects(access(path.join(target, excluded)));
  }
  await assert.rejects(copyProject(root, target), /Katalog już istnieje/);
});

test('trainer checkpoints compose with public starter without copying private source folders', async t => {
  const { root } = await fixture(t);
  const target = await materializeCheckpoint(root, 'after-lab03', '.workshop-tmp/reference');
  assert.equal(await readFile(path.join(target, 'tests/example.ts'), 'utf8'), 'private solution');
  await assert.rejects(access(path.join(target, 'trainer-private')));
  assert.equal(await readFile(path.join(root, 'tests/example.ts'), 'utf8'), 'participant changes');
});

test('without trainer solutions public checkpoints work and unavailable stages fail before creating output', async t => {
  const { root } = await fixture(t);
  await rm(path.join(root, 'trainer-private'), { recursive: true });
  const start = await materializeCheckpoint(root, 'start', '.workshop-tmp/start');
  assert.equal(await readFile(path.join(start, 'tests/example.ts'), 'utf8'), 'starter');
  await assert.rejects(materializeCheckpoint(root, 'after-lab03', '.workshop-tmp/missing'), /nie jest dostępny/);
  await assert.rejects(access(path.join(root, '.workshop-tmp/missing')));
});
