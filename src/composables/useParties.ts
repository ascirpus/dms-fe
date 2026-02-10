import { ref } from 'vue';
import { useMutation, useQueryClient } from 'vue-query';
import { useAuth } from './useAuth';
import { PartyService } from '@/services/PartyService';
import type {
  PartyDTO,
  PartyWithMembers,
  PartyUserDTO,
  PartyPermissionsDTO,
  PermissionAction,
  CreatePartyRequest,
} from '@/types';

const parties = ref<PartyWithMembers[]>([]);
const partyPermissions = ref<Map<string, Record<string, PermissionAction>>>(new Map());

export function useParties() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const partyService = new PartyService(apiClient);

  async function fetchParties(projectId: string): Promise<PartyWithMembers[]> {
    const result = await queryClient.fetchQuery({
      queryKey: ['projects', projectId, 'parties'],
      queryFn: () => partyService.fetchProjectParties(projectId),
    });
    parties.value = result.parties;
    return result.parties;
  }

  async function fetchPermissions(projectId: string): Promise<void> {
    const result = await queryClient.fetchQuery<PartyPermissionsDTO[]>({
      queryKey: ['projects', projectId, 'party-permissions'],
      queryFn: () => partyService.getPermissions(projectId),
    });
    const map = new Map<string, Record<string, PermissionAction>>();
    for (const pp of result) {
      map.set(pp.partyId, pp.permissions);
    }
    partyPermissions.value = map;
  }

  const createPartyMutation = useMutation({
    mutationFn: (params: { projectId: string; data: CreatePartyRequest }) =>
      partyService.createParty(params.projectId, params.data),
    onSuccess: (created: PartyDTO, params) => {
      const optimistic = parties.value.find(p => p.party.id.startsWith('temp-'));
      if (optimistic) {
        optimistic.party.id = created.id;
      }
      queryClient.invalidateQueries(['projects', params.projectId, 'parties']);
    },
  });

  async function createParty(projectId: string, data: CreatePartyRequest): Promise<PartyDTO> {
    const tempId = `temp-${Date.now()}`;
    const optimisticParty: PartyWithMembers = {
      party: { id: tempId, name: data.name, description: data.description, meta: data.meta ?? {}, createdAt: new Date().toISOString() },
      members: [],
    };
    parties.value.push(optimisticParty);

    try {
      const created = await createPartyMutation.mutateAsync({ projectId, data });
      return created;
    } catch (err) {
      parties.value = parties.value.filter(p => p.party.id !== tempId);
      throw err;
    }
  }

  const deletePartyMutation = useMutation({
    mutationFn: (params: { projectId: string; partyId: string }) =>
      partyService.deleteParty(params.projectId, params.partyId),
    onSettled: (_data, _err, params) => {
      queryClient.invalidateQueries(['projects', params.projectId, 'parties']);
    },
  });

  async function deleteParty(projectId: string, partyId: string): Promise<void> {
    const idx = parties.value.findIndex(p => p.party.id === partyId);
    if (idx === -1) return;
    const removed = parties.value.splice(idx, 1)[0];

    try {
      await deletePartyMutation.mutateAsync({ projectId, partyId });
    } catch (err) {
      parties.value.splice(idx, 0, removed);
      throw err;
    }
  }

  const addMemberMutation = useMutation({
    mutationFn: (params: { projectId: string; partyId: string; userId: string }) =>
      partyService.addMember(params.projectId, params.partyId, params.userId),
    onSettled: (_data, _err, params) => {
      queryClient.invalidateQueries(['projects', params.projectId, 'parties']);
    },
  });

  async function addMember(
    projectId: string,
    partyId: string,
    user: PartyUserDTO,
  ): Promise<void> {
    const party = parties.value.find(p => p.party.id === partyId);
    if (!party) return;

    party.members.push(user);

    try {
      await addMemberMutation.mutateAsync({ projectId, partyId, userId: user.id });
    } catch (err) {
      party.members = party.members.filter(m => m.id !== user.id);
      throw err;
    }
  }

  const removeMemberMutation = useMutation({
    mutationFn: (params: { projectId: string; partyId: string; userId: string }) =>
      partyService.removeMember(params.projectId, params.partyId, params.userId),
    onSettled: (_data, _err, params) => {
      queryClient.invalidateQueries(['projects', params.projectId, 'parties']);
    },
  });

  async function removeMember(
    projectId: string,
    partyId: string,
    userId: string,
  ): Promise<void> {
    const party = parties.value.find(p => p.party.id === partyId);
    if (!party) return;

    const idx = party.members.findIndex(m => m.id === userId);
    if (idx === -1) return;
    const removed = party.members.splice(idx, 1)[0];

    try {
      await removeMemberMutation.mutateAsync({ projectId, partyId, userId });
    } catch (err) {
      party.members.splice(idx, 0, removed);
      throw err;
    }
  }

  async function setPermissions(
    projectId: string,
    partyId: string,
    permissions: Record<string, PermissionAction>,
  ): Promise<void> {
    const previous = partyPermissions.value.get(partyId);
    if (Object.keys(permissions).length > 0) {
      partyPermissions.value.set(partyId, permissions);
    } else {
      partyPermissions.value.delete(partyId);
    }

    try {
      if (Object.keys(permissions).length === 0) {
        await partyService.removePermissions(projectId, partyId);
      } else {
        await partyService.setPermissions(projectId, partyId, permissions);
      }
      queryClient.invalidateQueries(['projects', projectId, 'party-permissions']);
    } catch (err) {
      if (previous) {
        partyPermissions.value.set(partyId, previous);
      } else {
        partyPermissions.value.delete(partyId);
      }
      throw err;
    }
  }

  return {
    parties,
    partyPermissions,
    fetchParties,
    fetchPermissions,
    createParty,
    deleteParty,
    addMember,
    removeMember,
    setPermissions,
  };
}
