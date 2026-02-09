import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBilling } from '../useBilling';
import { useAuth } from '../useAuth';
import { useQueryClient } from 'vue-query';
import type { BillingStatus, BillingPlan } from '@/types';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
    useQueryClient: vi.fn(),
}));

describe('useBilling', () => {
    let mockApiClient: any;
    let mockQueryClient: any;

    const mockBillingStatus: BillingStatus = {
        subscription: {
            status: 'ACTIVE',
            planId: 'plan-team',
            currentPeriodStart: '2024-01-01T00:00:00Z',
            currentPeriodEnd: '2024-02-01T00:00:00Z',
            cancelAtPeriodEnd: false,
        },
        currentPlan: {
            id: 'plan-team',
            name: 'Team',
            currency: 'eur',
            prices: [
                { interval: 'MONTHLY', priceInCents: 4900 },
                { interval: 'YEARLY', priceInCents: 49000 },
            ],
        },
        availablePlans: [],
    };

    const mockPlans: BillingPlan[] = [
        {
            id: 'plan-team',
            name: 'Team',
            currency: 'eur',
            prices: [
                { interval: 'MONTHLY', priceInCents: 4900 },
                { interval: 'YEARLY', priceInCents: 49000 },
            ],
        },
        {
            id: 'plan-business',
            name: 'Business',
            currency: 'eur',
            prices: [
                { interval: 'MONTHLY', priceInCents: 14900 },
                { interval: 'YEARLY', priceInCents: 149000 },
            ],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        mockApiClient = {
            get: vi.fn(),
            post: vi.fn(),
        };

        mockQueryClient = {
            fetchQuery: vi.fn(),
            invalidateQueries: vi.fn(),
        };

        vi.mocked(useAuth).mockReturnValue({
            apiClient: mockApiClient,
        } as any);

        vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);

        // Reset module-level state
        const { billingStatus, plans } = useBilling();
        billingStatus.value = null;
        plans.value = [];
    });

    describe('fetchBillingStatus', () => {
        it('should fetch and store billing status', async () => {
            mockQueryClient.fetchQuery.mockResolvedValue(mockBillingStatus);

            const { fetchBillingStatus, billingStatus, currentSubscription, isSubscribed, currentPlan } = useBilling();
            await fetchBillingStatus();

            expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: ['billingStatus'] })
            );
            expect(billingStatus.value).toEqual(mockBillingStatus);
            expect(currentSubscription.value).toEqual(mockBillingStatus.subscription);
            expect(isSubscribed.value).toBe(true);
            expect(currentPlan.value).toEqual(mockBillingStatus.currentPlan);
        });

        it('should return isSubscribed false when no subscription', async () => {
            const noSub: BillingStatus = { availablePlans: [] };
            mockQueryClient.fetchQuery.mockResolvedValue(noSub);

            const { fetchBillingStatus, isSubscribed, currentSubscription } = useBilling();
            await fetchBillingStatus();

            expect(isSubscribed.value).toBe(false);
            expect(currentSubscription.value).toBeNull();
        });
    });

    describe('fetchPlans', () => {
        it('should fetch and store plans', async () => {
            mockQueryClient.fetchQuery.mockResolvedValue(mockPlans);

            const { fetchPlans, plans } = useBilling();
            await fetchPlans();

            expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: ['billingPlans'] })
            );
            expect(plans.value).toEqual(mockPlans);
        });
    });

    describe('startCheckout', () => {
        it('should create checkout session with default MONTHLY interval and redirect', async () => {
            const mockCheckoutResponse = {
                sessionId: 'cs_test_123',
                url: 'https://checkout.stripe.com/session/cs_test_123',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockCheckoutResponse },
            });

            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                value: { ...originalLocation, href: '', origin: 'https://dms.internal:5173' },
                writable: true,
            });

            const { startCheckout } = useBilling();
            await startCheckout('plan-team');

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/checkout', {
                planId: 'plan-team',
                interval: 'MONTHLY',
                successUrl: 'https://dms.internal:5173/app/billing/success',
                cancelUrl: 'https://dms.internal:5173/app/billing/cancel',
            });
            expect(window.location.href).toBe(mockCheckoutResponse.url);

            Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
        });

        it('should pass YEARLY interval when specified', async () => {
            const mockCheckoutResponse = {
                sessionId: 'cs_test_456',
                url: 'https://checkout.stripe.com/session/cs_test_456',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockCheckoutResponse },
            });

            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                value: { ...originalLocation, href: '', origin: 'https://dms.internal:5173' },
                writable: true,
            });

            const { startCheckout } = useBilling();
            await startCheckout('plan-business', 'YEARLY');

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/checkout', {
                planId: 'plan-business',
                interval: 'YEARLY',
                successUrl: 'https://dms.internal:5173/app/billing/success',
                cancelUrl: 'https://dms.internal:5173/app/billing/cancel',
            });
            expect(window.location.href).toBe(mockCheckoutResponse.url);

            Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
        });
    });

    describe('openBillingPortal', () => {
        it('should create portal session and redirect', async () => {
            const mockPortalResponse = {
                url: 'https://billing.stripe.com/session/bps_test_123',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockPortalResponse },
            });

            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                value: { ...originalLocation, href: '', origin: 'https://dms.internal:5173' },
                writable: true,
            });

            const { openBillingPortal } = useBilling();
            await openBillingPortal();

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/portal', {
                returnUrl: 'https://dms.internal:5173/app/workspace',
            });
            expect(window.location.href).toBe(mockPortalResponse.url);

            Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel subscription and update local state', async () => {
            const cancelledSubscription = {
                status: 'CANCELED' as const,
                planId: 'plan-team',
                currentPeriodStart: '2024-01-01T00:00:00Z',
                currentPeriodEnd: '2024-02-01T00:00:00Z',
                cancelAtPeriodEnd: true,
                canceledAt: '2024-01-15T00:00:00Z',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: cancelledSubscription },
            });

            // Set up initial billing status
            mockQueryClient.fetchQuery.mockResolvedValue(mockBillingStatus);
            const { fetchBillingStatus, cancelSubscription, billingStatus, isSubscribed } = useBilling();
            await fetchBillingStatus();

            expect(isSubscribed.value).toBe(true);

            const result = await cancelSubscription();

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/cancel');
            expect(result.status).toBe('CANCELED');
            expect(billingStatus.value?.subscription?.status).toBe('CANCELED');
            expect(isSubscribed.value).toBe(false);
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['billingStatus']);
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['tenant']);
        });
    });
});
