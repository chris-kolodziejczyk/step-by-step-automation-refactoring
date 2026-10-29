import { randomUUID } from 'node:crypto';
import { test as base, expect, type APIRequestContext, type TestInfo } from '@playwright/test';
import { WorkshopClient, bindWorkspace, type Workspace } from '../api/workshop-client';

export type WorkshopFixtures = { workspace: Workspace };

function metadata(workspace: Workspace, testInfo: TestInfo, runId: string, createdAt: string) {
  return {
    runId,
    workspaceId: workspace.id,
    worker: testInfo.workerIndex,
    parallelIndex: testInfo.parallelIndex,
    repeat: testInfo.repeatEachIndex,
    retry: testInfo.retry,
    profile: process.env.QC_PROFILE || 'normal',
    fault: process.env.QC_FAULT || null,
    createdAt,
  };
}

async function attach(testInfo: TestInfo, name: string, value: unknown) {
  await testInfo.attach(name, { body: Buffer.from(JSON.stringify(value, null, 2)), contentType: 'application/json' });
}

export const test = base.extend<WorkshopFixtures>({
  workspace: async ({ playwright, baseURL }, use, testInfo) => {
    const runId = process.env.QC_RUN_ID || `local-${randomUUID()}`;
    const control = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { 'x-qc-control': process.env.QC_CONTROL_TOKEN || 'workshop-local-control' },
    });
    const client = new WorkshopClient(control);
    let workspace: Workspace | undefined;
    let createdAt: string | undefined;
    let useStartedAt: string | undefined;
    let deletedAt: string | undefined;
    try {
      workspace = await client.createWorkspace(runId);
      createdAt = new Date().toISOString();
      await attach(testInfo, 'workspace.json', { ...metadata(workspace, testInfo, runId, createdAt), phase: 'created' });
      useStartedAt = new Date().toISOString();
      await use(workspace);
    } finally {
      const useEndedAt = new Date().toISOString();
      if (workspace) {
        try {
          try {
            await attach(testInfo, 'control-events.json', await client.inspectWorkspace(workspace.id));
          } finally {
            await client.deleteWorkspace(workspace.id);
            deletedAt = new Date().toISOString();
            await attach(testInfo, 'cleanup.json', { workspaceId: workspace.id, deleted: true, deletedAt });
          }
        } finally {
          try {
            await attach(testInfo, 'workspace-lifecycle.json', {
              workspaceId: workspace.id, runId, worker: testInfo.workerIndex,
              createdAt, useStartedAt, useEndedAt, deletedAt,
            });
          } finally {
            await control.dispose();
          }
        }
      } else {
        await control.dispose();
      }
    }
  },
  page: async ({ page, workspace, baseURL }, use) => {
    await bindWorkspace(page.context(), baseURL!, workspace);
    await use(page);
  },
});

type SharedWorker = { sharedWorkspace: { workspace: Workspace; client: WorkshopClient; control: APIRequestContext; runId: string; createdAt: string } };

// Deliberate starter debt D-03: SC-04 consumes the backend cart left by SC-03.
export const sharedTest = base.extend<WorkshopFixtures, SharedWorker>({
  sharedWorkspace: [async ({ playwright }, use, workerInfo) => {
    const runId = process.env.QC_RUN_ID || `legacy-${randomUUID()}`;
    const control = await playwright.request.newContext({
      baseURL: workerInfo.project.use.baseURL,
      extraHTTPHeaders: { 'x-qc-control': process.env.QC_CONTROL_TOKEN || 'workshop-local-control' },
    });
    const client = new WorkshopClient(control);
    let workspace: Workspace | undefined;
    try {
      workspace = await client.createWorkspace(runId);
      await use({ workspace, client, control, runId, createdAt: new Date().toISOString() });
    } finally {
      try {
        if (workspace) await client.deleteWorkspace(workspace.id);
      } finally {
        await control.dispose();
      }
    }
  }, { scope: 'worker' }],
  workspace: async ({ sharedWorkspace }, use, testInfo) => {
    const { workspace, client, runId, createdAt } = sharedWorkspace;
    await attach(testInfo, 'workspace.json', { ...metadata(workspace, testInfo, runId, createdAt), phase: 'shared-starter' });
    try {
      await use(workspace);
    } finally {
      await attach(testInfo, 'control-events.json', await client.inspectWorkspace(workspace.id));
    }
  },
  page: async ({ page, workspace, baseURL }, use) => {
    await bindWorkspace(page.context(), baseURL!, workspace);
    await use(page);
  },
});

export { expect };
