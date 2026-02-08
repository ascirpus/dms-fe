import { ref, computed } from 'vue';
import { useQueryClient } from 'vue-query';
import { useAuth } from '@/composables/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { TenantService } from '@/services/TenantService';
import type { Tenant, UserTenantSummary, TenantRole } from '@/types';
import { useRouter } from 'vue-router';

const currentWorkspace = ref<Tenant | null>(null);
const userWorkspaces = ref<UserTenantSummary[]>([]);
const workspacesLoaded = ref(false);

export function useWorkspace() {
    const { apiClient, getCurrentTenantId } = useAuth();
    const authStore = useAuthStore();
    const tenantService = new TenantService(apiClient);
    const queryClient = useQueryClient();
    const router = useRouter();

    const currentWorkspaceName = computed(() => currentWorkspace.value?.name ?? '');

    const currentWorkspaceRole = computed<TenantRole | null>(() => {
        const tenantId = getCurrentTenantId();
        if (!tenantId) return null;
        const match = userWorkspaces.value.find(w => w.tenantId === tenantId);
        return match?.role ?? null;
    });

    async function fetchCurrentWorkspace(): Promise<Tenant> {
        const result = await queryClient.fetchQuery<Tenant>({
            queryKey: ['tenant'],
            queryFn: () => tenantService.fetchTenant(),
            staleTime: 60000,
        });
        currentWorkspace.value = result;
        return result;
    }

    async function fetchWorkspaces(): Promise<void> {
        const result = await queryClient.fetchQuery({
            queryKey: ['userTenants'],
            queryFn: () => tenantService.fetchUserTenants(),
            staleTime: 60000,
        });
        userWorkspaces.value = result.tenants;
        workspacesLoaded.value = true;
        await fetchCurrentWorkspace();
    }

    async function switchWorkspace(tenantId: string): Promise<void> {
        authStore.setTenantId(tenantId);
        queryClient.clear();

        tenantService.selectTenant(tenantId).catch(err => {
            console.warn('[dms-fe] Failed to notify backend of workspace switch:', err);
        });

        await fetchCurrentWorkspace();
        router.push({ name: 'projects' });
    }

    return {
        currentWorkspace,
        userWorkspaces,
        workspacesLoaded,
        currentWorkspaceName,
        currentWorkspaceRole,
        fetchWorkspaces,
        fetchCurrentWorkspace,
        switchWorkspace,
    };
}
