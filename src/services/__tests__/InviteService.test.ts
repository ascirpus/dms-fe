import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InviteService } from '../InviteService';
import type { AxiosInstance } from 'axios';
import type { TenantInvite, UserPendingInvite, CreateInviteRequest, JoinTenantRequest } from '@/types';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}));

describe('InviteService', () => {
  let service: InviteService;
  let mockApiClient: AxiosInstance;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    } as any;
    service = new InviteService(mockApiClient);
  });

  describe('createInvite', () => {
    it('should create an invite', async () => {
      const mockInvite: TenantInvite = {
        id: 'inv-1',
        email: 'user@test.com',
        invitedBy: { userId: 'u1', email: 'admin@test.com' },
        role: 'MEMBER',
        expiresAt: '2025-02-01T00:00:00',
        createdAt: '2025-01-01T00:00:00',
      };

      vi.mocked(mockApiClient.post).mockResolvedValue({
        data: { status: 'SUCCESS', data: mockInvite },
      });

      const request: CreateInviteRequest = { email: 'user@test.com', role: 'MEMBER' };
      const result = await service.createInvite(request);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/tenants/current/invites',
        request,
      );
      expect(result).toEqual(mockInvite);
    });
  });

  describe('listPendingInvites', () => {
    it('should fetch pending invites for the current tenant', async () => {
      const mockInvites: TenantInvite[] = [
        {
          id: 'inv-1',
          email: 'user@test.com',
          invitedBy: { userId: 'u1', email: 'admin@test.com' },
          role: 'MEMBER',
          expiresAt: '2025-02-01T00:00:00',
          createdAt: '2025-01-01T00:00:00',
        },
      ];

      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: mockInvites },
      });

      const result = await service.listPendingInvites();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tenants/current/invites');
      expect(result).toEqual(mockInvites);
    });
  });

  describe('cancelInvite', () => {
    it('should cancel an invite', async () => {
      vi.mocked(mockApiClient.delete).mockResolvedValue({});

      await service.cancelInvite('inv-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/tenants/current/invites/inv-1');
    });
  });

  describe('listUserPendingInvites', () => {
    it('should fetch pending invites for the current user', async () => {
      const mockInvites: UserPendingInvite[] = [
        {
          inviteId: 'inv-1',
          tenantId: 't1',
          tenantName: 'Acme Corp',
          role: 'MEMBER',
          expiresAt: '2025-02-01T00:00:00',
          createdAt: '2025-01-01T00:00:00',
        },
      ];

      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: mockInvites },
      });

      const result = await service.listUserPendingInvites();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tenants/invites/pending');
      expect(result).toEqual(mockInvites);
    });
  });

  describe('acceptInvite', () => {
    it('should accept an invite and return accepted data', async () => {
      const acceptedData = { projectAssignments: [{ projectId: 'proj-1', partyId: 'party-1' }] };
      vi.mocked(mockApiClient.post).mockResolvedValue({
        data: { status: 'SUCCESS', data: acceptedData },
      });

      const result = await service.acceptInvite('inv-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/tenants/invites/inv-1/accept');
      expect(result).toEqual(acceptedData);
    });
  });

  describe('joinTenant', () => {
    it('should join a tenant via plain client (unauthenticated)', async () => {
      const request: JoinTenantRequest = {
        inviteId: 'inv-1',
        password: 'securepass123',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Access the plain client via the service's internal structure
      const plainClient = (service as any).plainClient;
      vi.mocked(plainClient.post).mockResolvedValue({});

      await service.joinTenant(request);

      expect(plainClient.post).toHaveBeenCalledWith('/api/users/join', request);
    });
  });
});
