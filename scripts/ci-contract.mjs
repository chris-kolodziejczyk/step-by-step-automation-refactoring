import ts from 'typescript';

// Locate the participant's SC-01 callback, regardless of its formatting or filename.
export function injectCiFailure(source, variant) {
  if (!['only', 'assertion'].includes(variant)) throw new Error(`Nieznany wariant CI: ${variant}`);
  const parsed = ts.createSourceFile('scenario.ts', source, ts.ScriptTarget.Latest, true);
  const matches = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.arguments.length > 0 && ts.isStringLiteralLike(node.arguments[0]) && node.arguments[0].text.includes('[SC-01]')) {
      const callback = node.arguments.at(-1);
      if (callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) && ts.isBlock(callback.body)) matches.push({ node, callback });
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  if (matches.length !== 1) throw new Error('Kontrakt CI wymaga jednego testu SC-01 z blokiem funkcji. Sprawdź jego aktualną implementację.');
  const { node, callback } = matches[0];
  if (variant === 'only') {
    const end = node.expression.end;
    return source.slice(0, end) + '.only' + source.slice(end);
  }
  const start = callback.body.getStart(parsed) + 1;
  return source.slice(0, start) + "\n  throw new Error('CI-CONTRACT: deliberate failure');\n" + source.slice(start);
}
