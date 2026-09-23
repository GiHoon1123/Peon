import { beforeEach, describe, expect, it, vi } from 'vitest';

const findUnique = vi.fn();
const update = vi.fn();
const invalidate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: { service: { findUnique, update } },
}));
vi.mock('@/lib/auth/workspace-resources', () => ({
  assertBindingsInWorkspace: vi.fn(),
  workspaceIdForProject: vi.fn(),
  workspaceIdForService: vi.fn().mockResolvedValue('workspace-1'),
}));
vi.mock('@/services/internal/audit/service-audit', () => ({
  recordServiceAudit: vi.fn(),
}));
vi.mock('@/services/internal/audit/audit', () => ({
  AuditService: { record: vi.fn() },
}));
vi.mock('../runtime', () => ({ ServiceRuntime: { invalidate } }));

describe('service lifecycle runtime context', () => {
  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
    invalidate.mockReset();
    findUnique.mockResolvedValue({
      serverId: 'server-a',
      destinationId: null,
      project: { workspaceId: 'workspace-1' },
    });
    update.mockResolvedValue({ name: 'app' });
  });

  it('invalidates the context when update moves a service', async () => {
    const { update: updateService } = await import('../lifecycle');

    await updateService('service-1', { serverId: 'server-b' });

    expect(invalidate).toHaveBeenCalledWith('service-1');
  });

  it('invalidates the context when setServer moves a service', async () => {
    const { setServer } = await import('../lifecycle');

    await setServer('service-1', 'server-b');

    expect(invalidate).toHaveBeenCalledWith('service-1');
  });
});
