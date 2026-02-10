import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PartyService } from '../PartyService';
import type { CreatePartyRequest, PermissionAction, ProjectPartyMembers, PartyDTO, PartyPermissionsDTO } from '@/types';

describe('PartyService', () => {
  let mockApiClient: any;
  let service: PartyService;

  const mockParty: PartyDTO = {
    id: 'party-1',
    name: 'Reviewers',
    description: 'Document reviewers',
    meta: {},
    createdAt: '2025-01-01T00:00:00Z',
  };

  const mockProjectPartyMembers: ProjectPartyMembers = {
    projectId: 'proj-1',
    parties: [
      {
        party: mockParty,
        members: [{ id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' }],
      },
    ],
  };

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    service = new PartyService(mockApiClient);
  });

  describe('fetchProjectParties', () => {
    it('should fetch parties for a project', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockProjectPartyMembers },
      });

      const result = await service.fetchProjectParties('proj-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-1/party');
      expect(result).toEqual(mockProjectPartyMembers);
    });
  });

  describe('createParty', () => {
    it('should create a party', async () => {
      const request: CreatePartyRequest = { name: 'New Party' };
      mockApiClient.post.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockParty },
      });

      const result = await service.createParty('proj-1', request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/projects/proj-1/party', request);
      expect(result).toEqual(mockParty);
    });
  });

  describe('deleteParty', () => {
    it('should delete a party', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await service.deleteParty('proj-1', 'party-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/projects/proj-1/party/party-1');
    });
  });

  describe('addMember', () => {
    it('should add a member to a party', async () => {
      mockApiClient.post.mockResolvedValue({});

      await service.addMember('proj-1', 'party-1', 'user-2');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/party/party-1/members',
        { user_id: 'user-2' },
      );
    });
  });

  describe('removeMember', () => {
    it('should remove a member from a party', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await service.removeMember('proj-1', 'party-1', 'user-2');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/api/projects/proj-1/party/party-1/members',
        { data: { user_id: 'user-2' } },
      );
    });
  });

  describe('getPermissions', () => {
    it('should fetch permissions for a project', async () => {
      const mockPermissions: PartyPermissionsDTO[] = [
        { partyId: 'party-1', permissions: { 'doctype-1': 'VIEW' as PermissionAction } },
      ];
      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockPermissions },
      });

      const result = await service.getPermissions('proj-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-1/party/permissions');
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('setPermissions', () => {
    it('should set permissions for a party', async () => {
      const permissions: Record<string, PermissionAction> = {
        'doctype-1': 'VIEW',
        'doctype-2': 'COMMENT',
      };
      mockApiClient.post.mockResolvedValue({});

      await service.setPermissions('proj-1', 'party-1', permissions);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/party/party-1/permission',
        { permissions },
      );
    });
  });

  describe('removePermissions', () => {
    it('should remove permissions for a party', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await service.removePermissions('proj-1', 'party-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/api/projects/proj-1/party/party-1/permission',
      );
    });
  });

  describe('error handling', () => {
    it('should throw on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(service.fetchProjectParties('proj-1')).rejects.toThrow('Network Error');
    });
  });
});
