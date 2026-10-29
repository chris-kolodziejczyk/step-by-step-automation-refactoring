import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const errors = [];
function inspect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) inspect(file);
    else if (/\.(ts|mjs)$/.test(file)) {
      const text = readFileSync(file, 'utf8');
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
      for (const diagnostic of source.parseDiagnostics) errors.push(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
      function visit(node) {
        if (file.startsWith('tests') && ts.isCallExpression(node) && /\.(only|skip|fixme|fail)$/.test(node.expression.getText(source))) errors.push(`${file}: zabronione pomijanie/fokus/oczekiwana awaria`);
        if (ts.isCatchClause(node) && node.block.statements.length === 0) errors.push(`${file}: pusty catch`);
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
}
for (const dir of ['app', 'tests', 'scripts', 'contracts']) inspect(dir);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Lint: składnia oraz reguły warsztatowe OK (celowe sleep/nth w starterze są dozwolone).');
