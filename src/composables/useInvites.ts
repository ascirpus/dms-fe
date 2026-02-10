import { ref } from 'vue';
import { useMutation, useQueryClient } from 'vue-query';
import { useAuth } from './useAuth';
import { InviteService } from '@/services/InviteService';
import type { TenantInvite, UserPendingInvite, CreateInviteRequest, AcceptedInvite, JoinTenantRequest } from '@/types';

export function useInvites() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const inviteService = new InviteService(apiClient);

  const pendingInvites = ref<TenantInvite[]>([]);
  const userPendingInvites = ref<UserPendingInvite[]>([]);

  async function fetchPendingInvites(): Promise<TenantInvite[]> {
    const result = await queryClient.fetchQuery<TenantInvite[]>({
      queryKey: ['tenant-invites'],
      queryFn: () => inviteService.listPendingInvites(),
    });
    pendingInvites.value = result;
    return result;
  }

  async function fetchUserPendingInvites(): Promise<UserPendingInvite[]> {
    const result = await queryClient.fetchQuery<UserPendingInvite[]>({
      queryKey: ['user-pending-invites'],
      queryFn: () => inviteService.listUserPendingInvites(),
    });
    userPendingInvites.value = result;
    return result;
  }

  const createInviteMutation = useMutation({
    mutationFn: (request: CreateInviteRequest) => inviteService.createInvite(request),
    onSuccess: (created: TenantInvite) => {
      pendingInvites.value = [...pendingInvites.value, created];
      queryClient.invalidateQueries(['tenant-invites']);
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId: string) => inviteService.cancelInvite(inviteId),
    onMutate: async (inviteId: string) => {
      const previous = [...pendingInvites.value];
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        pendingInvites.value = context.previous;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tenant-invites']);
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (inviteId: string) => inviteService.acceptInvite(inviteId),
    onSuccess: (_data: AcceptedInvite, inviteId: string) => {
      userPendingInvites.value = userPendingInvites.value.filter(i => i.inviteId !== inviteId);
      queryClient.invalidateQueries(['user-pending-invites']);
      queryClient.invalidateQueries(['userTenants']);
    },
  });

  async function createInvite(request: CreateInviteRequest): Promise<TenantInvite> {
    return createInviteMutation.mutateAsync(request);
  }

  function cancelInvite(inviteId: string) {
    return cancelInviteMutation.mutateAsync(inviteId);
  }

  function acceptInvite(inviteId: string): Promise<AcceptedInvite> {
    return acceptInviteMutation.mutateAsync(inviteId);
  }

  async function joinTenant(request: JoinTenantRequest): Promise<void> {
    await inviteService.joinTenant(request);
  }

  return {
    pendingInvites,
    userPendingInvites,
    fetchPendingInvites,
    fetchUserPendingInvites,
    createInvite,
    cancelInvite,
    acceptInvite,
    joinTenant,
  };
}
