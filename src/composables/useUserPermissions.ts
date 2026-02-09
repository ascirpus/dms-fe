import { ref } from 'vue';
import { useQueryClient } from 'vue-query';
import type { UserPermissionOverride } from '@/types/UserPermission';
import { useAuth } from './useAuth';
import { UserPermissionsService } from '@/services/UserPermissionsService';

export function useUserPermissions() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const service = new UserPermissionsService(apiClient);

  const overrides = ref<UserPermissionOverride[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchOverrides(): Promise<UserPermissionOverride[]> {
    loading.value = true;
    error.value = null;
    try {
      const response = await queryClient.fetchQuery<UserPermissionOverride[]>({
        queryKey: ['my-permission-overrides'],
        queryFn: async () => await service.fetchMyOverrides(),
      });
      overrides.value = response;
      return response;
    } catch (e) {
      error.value = e as Error;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    overrides,
    loading,
    error,
    fetchOverrides,
  };
}
