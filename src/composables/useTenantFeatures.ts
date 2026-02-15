import { ref, computed } from 'vue';
import { useQueryClient } from 'vue-query';
import { useAuth } from '@/composables/useAuth';
import { TenantService } from '@/services/TenantService';
import type { Tenant, TenantFeature, FeatureName } from '@/types';

const tenant = ref<Tenant | null>(null);

export function useTenantFeatures() {
    const { apiClient } = useAuth();
    const tenantService = new TenantService(apiClient);
    const queryClient = useQueryClient();

    async function fetchTenant(): Promise<Tenant> {
        const result = await queryClient.fetchQuery<Tenant>({
            queryKey: ['tenant'],
            queryFn: () => tenantService.fetchTenant(),
            staleTime: 60000,
        });
        tenant.value = result;
        return result;
    }

    const features = computed<TenantFeature[]>(() => tenant.value?.tier.features ?? []);

    function isFeatureEnabled(name: FeatureName): boolean {
        return features.value.some(f => f.feature === name && f.enabled);
    }

    const versioningEnabled = computed(() => isFeatureEnabled('DOCUMENT_VERSIONING'));
    const unlimitedDocumentTypesEnabled = computed(() => isFeatureEnabled('UNLIMITED_DOCUMENT_TYPES'));
    const selfStorageEnabled = computed(() => isFeatureEnabled('SELF_STORAGE'));

    return {
        tenant,
        features,
        fetchTenant,
        isFeatureEnabled,
        versioningEnabled,
        unlimitedDocumentTypesEnabled,
        selfStorageEnabled,
    };
}
