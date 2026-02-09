import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService, type TenantUser } from '../UsersService';

describe('UsersService', () => {
  let service: UsersService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
    };

    service = new UsersService(mockApiClient);
  });

  describe('fetchTenantUsers', () => {
    it('should fetch and return tenant users', async () => {
      const mockUsers: TenantUser[] = [
        {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'ADMIN',
          createdAt: '2024-01-15T10:30:00',
        },
        {
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'MEMBER',
          createdAt: '2024-01-14T14:22:00',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockUsers,
        },
      });

      const result = await service.fetchTenantUsers();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tenants/current/users');
      expect(result).toEqual(mockUsers);
    });

    it('should handle empty user list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      const result = await service.fetchTenantUsers();

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchTenantUsers()).rejects.toThrow('Network error');
    });

    it('should handle different user roles', async () => {
      const mockUsers: TenantUser[] = [
        {
          userId: 'user-1',
          firstName: 'Owner',
          lastName: 'User',
          email: 'owner@example.com',
          role: 'OWNER',
          createdAt: '2024-01-15T10:30:00',
        },
        {
          userId: 'user-2',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: '2024-01-14T14:22:00',
        },
        {
          userId: 'user-3',
          email: 'member@example.com',
          role: 'MEMBER',
          createdAt: '2024-01-13T08:15:00',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockUsers,
        },
      });

      const result = await service.fetchTenantUsers();

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe('OWNER');
      expect(result[1].role).toBe('ADMIN');
      expect(result[2].role).toBe('MEMBER');
    });
  });
});
