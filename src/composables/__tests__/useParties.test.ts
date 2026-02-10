import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useQueryClient, useMutation } from 'vue-query';
import { useParties } from '../useParties';
import type { PartyWithMembers, PartyUserDTO, PartyPermissionsDTO, PermissionAction } from '@/types';

vi.mock('../useAuth', () => ({
  useAuth: () => ({
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }),
}));

vi.mock('vue-query', () => ({
  useQueryClient: vi.fn(),
  useMutation: vi.fn(),
}));

describe('useParties', () => {
  let mockQueryClient: any;
  let mutationHandlers: Map<string, any>;

  const mockParty: PartyWithMembers = {
    party: { id: 'party-1', name: 'Reviewers', meta: {}, createdAt: '2025-01-01T00:00:00Z' },
    members: [{ id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' }],
  };

  const mockUser: PartyUserDTO = {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
  };

  beforeEach(() => {
    mockQueryClient = {
      fetchQuery: vi.fn(),
      invalidateQueries: vi.fn(),
    };
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);

    mutationHandlers = new Map();
    let callIndex = 0;
    const mutationNames = [
      'createParty',
      'deleteParty',
      'addMember',
      'removeMember',
    ];

    vi.mocked(useMutation).mockImplementation((config: any) => {
      const name = mutationNames[callIndex++] ?? `mutation-${callIndex}`;
      mutationHandlers.set(name, config);
      return {
        mutateAsync: vi.fn().mockImplementation((params: any) => config.mutationFn(params)),
      } as any;
    });
  });

  describe('fetchParties', () => {
    it('should fetch parties and update local state', async () => {
      mockQueryClient.fetchQuery.mockResolvedValue({
        projectId: 'proj-1',
        parties: [mockParty],
      });

      const { fetchParties, parties } = useParties();
      const result = await fetchParties('proj-1');

      expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith({
        queryKey: ['projects', 'proj-1', 'parties'],
        queryFn: expect.any(Function),
      });
      expect(result).toEqual([mockParty]);
      expect(parties.value).toEqual([mockParty]);
    });
  });

  describe('fetchPermissions', () => {
    it('should fetch permissions and populate the map', async () => {
      const mockPerms: PartyPermissionsDTO[] = [
        { partyId: 'party-1', permissions: { 'doctype-1': 'VIEW' as PermissionAction } },
      ];
      mockQueryClient.fetchQuery.mockResolvedValue(mockPerms);

      const { fetchPermissions, partyPermissions } = useParties();
      await fetchPermissions('proj-1');

      expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith({
        queryKey: ['projects', 'proj-1', 'party-permissions'],
        queryFn: expect.any(Function),
      });
      expect(partyPermissions.value.get('party-1')).toEqual({ 'doctype-1': 'VIEW' });
    });
  });

  describe('createParty', () => {
    it('should optimistically add party to list', () => {
      const { createParty, parties } = useParties();

      // Clear module-level state from previous tests
      parties.value = [];

      // Start createParty - it will add temp party then call mutation
      const promise = createParty('proj-1', { name: 'New Party' });

      // Optimistic party should have been added
      expect(parties.value.length).toBe(1);
      expect(parties.value[0].party.name).toBe('New Party');
      expect(parties.value[0].party.id).toMatch(/^temp-/);

      // Clean up - the promise will resolve/reject based on mutation
      promise.catch(() => {});
    });

    it('should remove optimistic party on error', async () => {
      // Override mutation to reject
      vi.mocked(useMutation).mockImplementation(() => ({
        mutateAsync: vi.fn().mockRejectedValue(new Error('Server Error')),
      } as any));

      const { createParty, parties } = useParties();
      // Clear any leftover state from previous tests (module-level ref)
      const countBefore = parties.value.length;

      await expect(createParty('proj-1', { name: 'New Party' })).rejects.toThrow('Server Error');
      // Should be back to where it was before the optimistic add
      expect(parties.value.length).toBe(countBefore);
    });
  });

  describe('deleteParty', () => {
    it('should optimistically remove party from list', async () => {
      const { deleteParty, parties } = useParties();
      parties.value = [mockParty];

      // The mutation mock will resolve successfully
      await deleteParty('proj-1', 'party-1');

      expect(parties.value).toEqual([]);
    });

    it('should restore party on error', async () => {
      // Set up mutation to reject
      vi.mocked(useMutation).mockImplementation((config: any) => ({
        mutateAsync: vi.fn().mockRejectedValue(new Error('Server Error')),
      } as any));

      const { deleteParty, parties } = useParties();
      parties.value = [mockParty];

      await expect(deleteParty('proj-1', 'party-1')).rejects.toThrow('Server Error');
      expect(parties.value).toEqual([mockParty]);
    });
  });

  describe('addMember', () => {
    it('should optimistically add member to party', async () => {
      const { addMember, parties } = useParties();
      parties.value = [{ ...mockParty, members: [...mockParty.members] }];

      await addMember('proj-1', 'party-1', mockUser);

      expect(parties.value[0].members).toContainEqual(mockUser);
    });

    it('should do nothing for unknown party', async () => {
      const { addMember, parties } = useParties();
      parties.value = [mockParty];

      await addMember('proj-1', 'unknown-party', mockUser);
      expect(parties.value[0].members).toHaveLength(1);
    });
  });

  describe('removeMember', () => {
    it('should optimistically remove member from party', async () => {
      const { removeMember, parties } = useParties();
      parties.value = [{ ...mockParty, members: [...mockParty.members] }];

      await removeMember('proj-1', 'party-1', 'user-1');

      expect(parties.value[0].members).toHaveLength(0);
    });

    it('should restore member on error', async () => {
      vi.mocked(useMutation).mockImplementation((config: any) => ({
        mutateAsync: vi.fn().mockRejectedValue(new Error('Failed')),
      } as any));

      const { removeMember, parties } = useParties();
      parties.value = [{ ...mockParty, members: [...mockParty.members] }];

      await expect(removeMember('proj-1', 'party-1', 'user-1')).rejects.toThrow('Failed');
      expect(parties.value[0].members).toHaveLength(1);
    });
  });

  describe('setPermissions', () => {
    it('should optimistically update permissions', async () => {
      const { setPermissions, partyPermissions } = useParties();

      const perms: Record<string, PermissionAction> = { 'doctype-1': 'COMMENT' };
      await setPermissions('proj-1', 'party-1', perms);

      expect(partyPermissions.value.get('party-1')).toEqual(perms);
    });

    it('should remove permissions when empty object passed', async () => {
      const { setPermissions, partyPermissions } = useParties();
      partyPermissions.value.set('party-1', { 'doctype-1': 'VIEW' as PermissionAction });

      await setPermissions('proj-1', 'party-1', {});

      expect(partyPermissions.value.has('party-1')).toBe(false);
    });
  });
});
