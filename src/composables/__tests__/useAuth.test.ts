import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useKeycloak } from '@josempgon/vue-keycloak';

vi.mock('@/stores/authStore');
vi.mock('@josempgon/vue-keycloak');

describe('useAuth', () => {
  let mockAuthStore: any;
  let mockKeycloak: any;

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
  });

  describe('getCurrentTenantId', () => {
    it('should return tenant ID from authStore', () => {
      mockAuthStore.tenantId = 'tenant-1';

      const { getCurrentTenantId } = useAuth();
      expect(getCurrentTenantId()).toBe('tenant-1');
    });

    it('should return null when no tenant ID is set', () => {
      mockAuthStore.tenantId = null;

      const { getCurrentTenantId } = useAuth();
      expect(getCurrentTenantId()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should extract user info from JWT', () => {
      mockKeycloak.decodedToken.value = {
        sub: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
      };
      mockKeycloak.isAuthenticated.value = true;

      const { getCurrentUser } = useAuth();
      const user = getCurrentUser();

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.picture).toBe('https://example.com/avatar.jpg');
    });

    it('should return empty user when not authenticated', () => {
      mockKeycloak.decodedToken.value = null;
      mockKeycloak.isAuthenticated.value = false;

      const { getCurrentUser } = useAuth();
      const user = getCurrentUser();

      expect(user.name).toBeUndefined();
      expect(user.email).toBe('');
      expect(user.picture).toBeUndefined();
    });
  });

  describe('getCurrentUser firstName/lastName', () => {
    it('should extract firstName and lastName from token', () => {
      mockKeycloak.decodedToken.value = {
        sub: 'user-123',
        given_name: 'John',
        family_name: 'Doe',
        name: 'John Doe',
        email: 'john@example.com',
      };
      mockKeycloak.isAuthenticated.value = true;

      const { getCurrentUser } = useAuth();
      const user = getCurrentUser();

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
    });

    it('should handle missing firstName/lastName gracefully', () => {
      mockKeycloak.decodedToken.value = {
        sub: 'user-123',
        email: 'user@example.com',
      };
      mockKeycloak.isAuthenticated.value = true;

      const { getCurrentUser } = useAuth();
      const user = getCurrentUser();

      expect(user.firstName).toBeUndefined();
      expect(user.lastName).toBeUndefined();
      expect(user.email).toBe('user@example.com');
    });
  });
});
