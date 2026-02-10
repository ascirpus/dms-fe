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
const isSwitching = ref(false);
const switchingToName = ref('');

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

    const canCreateWorkspace = computed(() => {
        const maxTenants = currentWorkspace.value?.tier.maxTenants;
        if (maxTenants === undefined || maxTenants === null) return false;
        return userWorkspaces.value.length < maxTenants;
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

    async function createWorkspace(name: string): Promise<void> {
        const newTenant = await tenantService.createWorkspace(name);
        userWorkspaces.value = [
            ...userWorkspaces.value,
            {
                tenantId: newTenant.id,
                name: newTenant.name,
                role: 'OWNER' as TenantRole,
                createdAt: newTenant.createdAt,
            },
        ];
        queryClient.invalidateQueries(['userTenants']);
        await switchWorkspace(newTenant.id);
    }

    async function switchWorkspace(tenantId: string): Promise<void> {
        const targetName = userWorkspaces.value.find(w => w.tenantId === tenantId)?.name ?? '';
        switchingToName.value = targetName;
        isSwitching.value = true;

        authStore.setTenantId(tenantId);
        queryClient.clear();

        try {
            await tenantService.selectTenant(tenantId);
        } catch (err) {
            console.warn('[dms-fe] Failed to notify backend of workspace switch:', err);
        }

        await fetchCurrentWorkspace();
        await router.push({ name: 'projects' });
        isSwitching.value = false;
    }

    return {
        currentWorkspace,
        userWorkspaces,
        workspacesLoaded,
        isSwitching,
        switchingToName,
        currentWorkspaceName,
        currentWorkspaceRole,
        canCreateWorkspace,
        fetchWorkspaces,
        fetchCurrentWorkspace,
        createWorkspace,
        switchWorkspace,
    };
}
