import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirst = vi.fn();

vi.mock('@/lib/prisma', () => ({ prisma: { service: { findFirst } } }));
vi.mock('@/lib/crypto/encryption', () => ({
  decrypt: (value: string) => value,
}));
vi.mock('@/lib/ssh', () => ({ sshPool: { exec: vi.fn() } }));
vi.mock('@/lib/docker/compose', () => ({
  parseCompose: vi.fn(),
  pickPrimaryComposeService: vi.fn(),
}));
vi.mock('@/lib/docker/naming', () => ({
  containerName: (name: string, uuid: string) => `${name}-${uuid}`,
}));
vi.mock('@/lib/shell/quote', () => ({
  shellSingleQuote: (value: string) => `'${value}'`,
  dockerExecShellCommand: vi.fn(),
}));
vi.mock('@/lib/errors', () => ({
  AppError: class extends Error {},
  NotFoundError: class extends Error {},
}));

const serviceOn = (serverId: string, host: string) => ({
  serverId,
  name: 'app',
  uuid: 'svc',
  activeContainerName: `${serverId}-container`,
  kind: 'APPLICATION',
  dockerComposeRaw: null,
  server: {
    id: serverId,
    ip: host,
    port: 22,
    user: 'root',
    privateKey: { privateKey: `${serverId}-key` },
  },
  settings: null,
});

describe('ServiceRuntime', () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it('uses the current server after its cached context is invalidated', async () => {
    findFirst.mockResolvedValueOnce(serviceOn('server-a', '10.0.0.1'));
    const { ServiceRuntime } = await import('../runtime');

    const first = await ServiceRuntime.resolveContainer('svc-id');
    ServiceRuntime.invalidate('svc-id');
    findFirst.mockResolvedValueOnce(serviceOn('server-b', '10.0.0.2'));
    const second = await ServiceRuntime.resolveContainer('svc-id');

    expect(first.target.host).toBe('10.0.0.1');
    expect(second.target.host).toBe('10.0.0.2');
    expect(findFirst).toHaveBeenCalledTimes(2);
  });
});
