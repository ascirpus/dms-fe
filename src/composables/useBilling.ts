import { ref, computed } from 'vue';
import { useQueryClient } from 'vue-query';
import { BillingService } from '@/services/BillingService';
import { useAuth } from './useAuth';
import type { BillingStatus, BillingPlan, BillingInterval, Subscription } from '@/types';

const billingStatus = ref<BillingStatus | null>(null);
const plans = ref<BillingPlan[]>([]);

export function useBilling() {
    const { apiClient } = useAuth();
    const queryClient = useQueryClient();
    const billingService = new BillingService(apiClient);

    const currentSubscription = computed(() => billingStatus.value?.subscription ?? null);
    const isSubscribed = computed(() => currentSubscription.value?.status === 'ACTIVE' || currentSubscription.value?.status === 'TRIALING');
    const currentPlan = computed(() => billingStatus.value?.currentPlan ?? null);

    async function fetchBillingStatus(): Promise<BillingStatus> {
        const result = await queryClient.fetchQuery<BillingStatus>({
            queryKey: ['billingStatus'],
            queryFn: () => billingService.fetchBillingStatus(),
            staleTime: 60000,
        });
        billingStatus.value = result;
        return result;
    }

    async function fetchPlans(): Promise<BillingPlan[]> {
        const result = await queryClient.fetchQuery<BillingPlan[]>({
            queryKey: ['billingPlans'],
            queryFn: () => billingService.fetchPlans(),
            staleTime: 60000,
        });
        plans.value = result;
        return result;
    }

    async function startCheckout(planId: string, interval: BillingInterval = 'MONTHLY'): Promise<void> {
        const baseUrl = window.location.origin;
        const response = await billingService.createCheckout({
            planId,
            interval,
            successUrl: `${baseUrl}/app/billing/success`,
            cancelUrl: `${baseUrl}/app/billing/cancel`,
        });
        window.location.href = response.url;
    }

    async function openBillingPortal(): Promise<void> {
        const baseUrl = window.location.origin;
        const response = await billingService.createPortalSession({
            returnUrl: `${baseUrl}/app/workspace`,
        });
        window.location.href = response.url;
    }

    async function cancelSubscription(): Promise<Subscription> {
        const result = await billingService.cancelSubscription();
        if (billingStatus.value) {
            billingStatus.value = {
                ...billingStatus.value,
                subscription: result,
            };
        }
        queryClient.invalidateQueries(['billingStatus']);
        queryClient.invalidateQueries(['tenant']);
        return result;
    }

    return {
        billingStatus,
        plans,
        currentSubscription,
        isSubscribed,
        currentPlan,
        fetchBillingStatus,
        fetchPlans,
        startCheckout,
        openBillingPortal,
        cancelSubscription,
    };
}
