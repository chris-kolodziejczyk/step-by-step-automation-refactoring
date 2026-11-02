import { cp, mkdir, readFile, readdir, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const excluded = new Set(['.git', 'node_modules', 'evidence', '.workshop-tmp', 'artifacts', 'playwright-report', 'test-results', 'trainer-private', 'docs/helpTR', 'docs/prezentacja', 'checkpoints/.validation']);

export async function copyProject(source, target, { dependencies = false, resetTests = false } = {}) {
  if (existsSync(target)) throw new Error(`Katalog już istnieje: ${target}. Wybierz nowy, aby zachować swoją pracę.`);
  await mkdir(target, { recursive: true });
  const filter = file => {
    const relative = path.relative(source, file).split(path.sep).join('/');
    return !excluded.has(relative) && !(resetTests && ['tests', 'workshop', 'archive'].includes(relative));
  };
  for (const entry of await readdir(source)) {
    const file = path.join(source, entry);
    if (filter(file)) await cp(file, path.join(target, entry), { recursive: true, filter });
  }
  if (dependencies) await symlink(path.join(source, 'node_modules'), path.join(target, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  return target;
}

export async function materializeCheckpoint(root, name, destination, options = {}) {
  name = name.replace('workshop/v0.1/', '');
  const catalog = JSON.parse(await readFile(path.join(root, 'checkpoints/catalog.json'), 'utf8')).order;
  if (!catalog.includes(name)) throw new Error(`Nieznany checkpoint ${name}`);
  const target = path.resolve(root, destination);
  const fromRoot = path.relative(root, target);
  if (!fromRoot || (!fromRoot.startsWith(`..${path.sep}`) && !path.isAbsolute(fromRoot) && fromRoot.split(path.sep)[0] !== '.workshop-tmp')) throw new Error('Wybierz nowy katalog obok repozytorium, np. ../qualitycart-lab04. Kopia wewnątrz źródła nie jest dozwolona.');
  const overlays = catalog.slice(0, catalog.indexOf(name) + 1).map(stage => {
    const publicPath = path.join(root, 'checkpoints', stage);
    const privatePath = path.join(root, 'trainer-private/checkpoints', stage);
    if (existsSync(publicPath)) return publicPath;
    if (existsSync(privatePath)) return privatePath;
    throw new Error(`Checkpoint ${stage} nie jest dostępny w tej kopii. Weryfikuj własny kod przez npm run lab -- verify LAB-XX bez --checkpoint. Rozwiązania trenera są lokalne w trainer-private/checkpoints/.`);
  });
  await copyProject(root, target, { ...options, resetTests: true });
  for (const overlay of overlays) {
    for (const entry of await readdir(overlay)) await cp(path.join(overlay, entry), path.join(target, entry), { recursive: true, force: true });
  }
  return target;
}
