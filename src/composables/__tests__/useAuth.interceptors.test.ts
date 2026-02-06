import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useKeycloak } from '@josempgon/vue-keycloak';

vi.mock('@/stores/authStore');
vi.mock('@josempgon/vue-keycloak');

describe('useAuth interceptors', () => {
  let mockAuthStore: any;
  let mockKeycloak: any;
  let apiClient: ReturnType<typeof useAuth>['apiClient'];

  beforeEach(() => {
    mockAuthStore = {
      tenantId: null,
      permissions: [],
      logout: vi.fn(),
      setTenantId: vi.fn(),
    };

    mockKeycloak = {
      keycloak: { value: null },
      token: { value: null },
      decodedToken: { value: null },
      isAuthenticated: { value: false },
    };

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore);
    vi.mocked(useKeycloak).mockReturnValue(mockKeycloak);

    ({ apiClient } = useAuth());
  });

  function setAdapter(handler: (config: any) => Promise<any>) {
    apiClient.defaults.adapter = handler as any;
  }

  function okResponse(config: any, data: any = {}) {
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  }

  function create401(config: any) {
    const error = new AxiosError(
      'Unauthorized',
      'ERR_BAD_RESPONSE',
      config,
      null,
      { status: 401, statusText: 'Unauthorized', headers: {}, config, data: {} } as any,
    );
    error.status = 401;
    return error;
  }

  describe('request interceptor', () => {
    it('reads keycloak token from raw instance, not reactive ref', async () => {
      mockKeycloak.keycloak.value = {
        token: 'raw-instance-token',
        updateToken: vi.fn().mockResolvedValue(true),
      };
      mockKeycloak.token.value = 'stale-reactive-ref';

      let captured: any;
      setAdapter(async (config) => { captured = config; return okResponse(config); });

      await apiClient.get('/test');

      expect(captured.headers.get('Authorization')).toBe('Bearer raw-instance-token');
    });

    it('calls keycloak updateToken(60)', async () => {
      const updateToken = vi.fn().mockResolvedValue(true);
      mockKeycloak.keycloak.value = { token: 'kc-token', updateToken };

      setAdapter(async (config) => okResponse(config));

      await apiClient.get('/test');

      expect(updateToken).toHaveBeenCalledWith(60);
    });

    it('proceeds without auth header if refresh fails', async () => {
      mockKeycloak.keycloak.value = {
        token: null,
        updateToken: vi.fn().mockRejectedValue(new Error('fail')),
      };

      let captured: any;
      setAdapter(async (config) => { captured = config; return okResponse(config); });

      await apiClient.get('/test');

      expect(captured.headers.get('Authorization')).toBeFalsy();
    });
  });

  describe('response interceptor - 401 retry', () => {
    it('retries with fresh token on 401', async () => {
      mockKeycloak.keycloak.value = {
        token: 'old-token',
        updateToken: vi.fn().mockImplementation(async () => {
          mockKeycloak.keycloak.value.token = 'fresh-token';
        }),
      };

      let callCount = 0;
      setAdapter(async (config) => {
        callCount++;
        if (callCount === 1) throw create401(config);
        return okResponse(config, { retried: true });
      });

      const response = await apiClient.get('/test');

      expect(callCount).toBe(2);
      expect(response.data).toEqual({ retried: true });
    });

    it('logs out when token refresh fails on 401', async () => {
      mockKeycloak.keycloak.value = {
        token: null,
        updateToken: vi.fn().mockRejectedValue(new Error('cannot refresh')),
      };

      setAdapter(async (config) => { throw create401(config); });

      await expect(apiClient.get('/test')).rejects.toThrow();

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('does not retry more than once (prevents infinite loop)', async () => {
      mockKeycloak.keycloak.value = {
        token: 'token',
        updateToken: vi.fn().mockResolvedValue(true),
      };

      let callCount = 0;
      setAdapter(async (config) => {
        callCount++;
        throw create401(config);
      });

      await expect(apiClient.get('/test')).rejects.toThrow();

      expect(callCount).toBe(2);
    });

    it('does not retry or logout on non-401 errors', async () => {
      mockKeycloak.keycloak.value = {
        token: 'token',
        updateToken: vi.fn().mockResolvedValue(true),
      };

      let callCount = 0;
      setAdapter(async (config) => {
        callCount++;
        const error = new AxiosError(
          'Internal Server Error',
          'ERR_BAD_RESPONSE',
          config,
          null,
          { status: 500, statusText: 'Internal Server Error', headers: {}, config, data: {} } as any,
        );
        error.status = 500;
        throw error;
      });

      await expect(apiClient.get('/test')).rejects.toThrow();

      expect(callCount).toBe(1);
      expect(mockAuthStore.logout).not.toHaveBeenCalled();
    });
  });

  describe('refresh deduplication', () => {
    it('concurrent 401s share a single token refresh', async () => {
      const updateToken = vi.fn().mockImplementation(async () => {
        await new Promise(r => setTimeout(r, 50));
        mockKeycloak.keycloak.value.token = 'shared-fresh';
      });
      mockKeycloak.keycloak.value = { token: 'old', updateToken };

      const failedOnce = new Set<string>();
      setAdapter(async (config) => {
        if (!failedOnce.has(config.url!)) {
          failedOnce.add(config.url!);
          throw create401(config);
        }
        return okResponse(config, { ok: true });
      });

      const [r1, r2] = await Promise.all([
        apiClient.get('/a'),
        apiClient.get('/b'),
      ]);

      expect(r1.data).toEqual({ ok: true });
      expect(r2.data).toEqual({ ok: true });
      expect(updateToken.mock.calls.length).toBeLessThan(6);
    });
  });
});
