import type { FullConfig, FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
const plain = (text?: string) => text?.replace(/\u001b\[[0-9;]*m/g, '');

export default class EvidenceReporter implements Reporter {
  results: unknown[] = [];
  config?: FullConfig;
  globalErrors: unknown[] = [];
  onBegin(config: FullConfig) { this.config = config; }
  onError(error: unknown) { this.globalErrors.push(error); }
  onTestEnd(test: TestCase, result: TestResult) {
    const attachments = result.attachments.map(a => {
      let data: unknown;
      if (a.contentType === 'application/json') {
        try { data = JSON.parse(a.body ? a.body.toString() : readFileSync(a.path!, 'utf8')); }
        catch (error) { data = { attachmentReadError: String(error) }; }
      }
      return { name: a.name, path: a.path, contentType: a.contentType, data };
    });
    this.results.push({
      id: test.title.match(/\[(SC-\d{2})\]/)?.[1],
      implementation: test.title.match(/\[(legacy|refactored|shadow)\]/)?.[1],
      title: test.title, file: relative(process.cwd(), test.location.file).replaceAll('\\', '/'),
      status: result.status, expectedStatus: test.expectedStatus,
      durationMs: result.duration, startTime: result.startTime.toISOString(),
      workerIndex: result.workerIndex, parallelIndex: result.parallelIndex,
      retry: result.retry, repeatEachIndex: test.repeatEachIndex,
      errors: result.errors.map(e => ({ message: plain(e.message), stack: plain(e.stack), location: e.location })),
      attachments,
    });
  }
  onEnd(result: FullResult) {
    const target = process.env.QC_REPORT_FILE || 'evidence/latest/results.json';
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, JSON.stringify({
      schemaVersion: 1, status: result.status, startTime: result.startTime,
      durationMs: result.duration, configuredWorkers: this.config?.workers,
      retries: this.config?.projects[0]?.retries, results: this.results, globalErrors: this.globalErrors,
    }, null, 2));
  }
}
