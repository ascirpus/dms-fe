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
      cleanStorage: vi.fn(),
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

    // Reset module-level currentUser between tests
    const { currentUser } = useAuth();
    currentUser.value = null;
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
    it('should return null before fetchCurrentUser is called', () => {
      const { getCurrentUser } = useAuth();
      const user = getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return user data after fetchCurrentUser', async () => {
      const { fetchCurrentUser, getCurrentUser, apiClient } = useAuth();

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'SUCCESS',
          data: {
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            locale: 'en',
            picture: 'https://example.com/avatar.jpg',
          },
        },
      });

      await fetchCurrentUser();
      const user = getCurrentUser();

      expect(user).not.toBeNull();
      expect(user!.email).toBe('john@example.com');
      expect(user!.firstName).toBe('John');
      expect(user!.lastName).toBe('Doe');
      expect(user!.phone).toBe('+1234567890');
      expect(user!.picture).toBe('https://example.com/avatar.jpg');
    });

    it('should return null when fetchCurrentUser fails', async () => {
      const { fetchCurrentUser, getCurrentUser, apiClient } = useAuth();

      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network error'));

      await fetchCurrentUser();
      const user = getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update currentUser after successful PUT', async () => {
      const { updateProfile, getCurrentUser, apiClient } = useAuth();

      vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
        data: {
          status: 'SUCCESS',
          data: {
            email: 'john@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
            phone: '+9999999999',
            locale: 'en',
          },
        },
      });

      const result = await updateProfile({ firstName: 'Jane', phone: '+9999999999' });

      expect(result).not.toBeNull();
      expect(result!.firstName).toBe('Jane');

      const user = getCurrentUser();
      expect(user!.firstName).toBe('Jane');
      expect(user!.phone).toBe('+9999999999');
    });

    it('should throw on API failure', async () => {
      const { updateProfile, apiClient } = useAuth();

      vi.spyOn(apiClient, 'put').mockRejectedValueOnce(new Error('Server error'));

      await expect(updateProfile({ firstName: 'Test' })).rejects.toThrow('Server error');
    });
  });

  describe('logout', () => {
    it('should clear currentUser on logout', async () => {
      const { fetchCurrentUser, getCurrentUser, logout, apiClient } = useAuth();

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'SUCCESS',
          data: { email: 'john@example.com', locale: 'en', notificationOverrides: {} },
        },
      });

      await fetchCurrentUser();
      expect(getCurrentUser()).not.toBeNull();

      logout();
      expect(getCurrentUser()).toBeNull();
    });
  });
});
