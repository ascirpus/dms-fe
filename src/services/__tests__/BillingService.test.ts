import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from '../BillingService';
import type { BillingStatus, BillingPlan, Subscription, CheckoutRequest, CheckoutResponse, PortalResponse } from '@/types';

describe('BillingService', () => {
    let service: BillingService;
    let mockApiClient: any;

    const mockBillingStatus: BillingStatus = {
        subscription: {
            status: 'ACTIVE',
            planId: 'plan-pro',
            currentPeriodStart: '2024-01-01T00:00:00Z',
            currentPeriodEnd: '2024-02-01T00:00:00Z',
            cancelAtPeriodEnd: false,
        },
        currentPlan: {
            id: 'plan-pro',
            name: 'Pro',
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
        mockApiClient = {
            get: vi.fn(),
            post: vi.fn(),
        };
        service = new BillingService(mockApiClient);
    });

    describe('fetchBillingStatus', () => {
        it('should fetch and return billing status', async () => {
            mockApiClient.get.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockBillingStatus },
            });

            const result = await service.fetchBillingStatus();

            expect(mockApiClient.get).toHaveBeenCalledWith('/api/billing/status');
            expect(result).toEqual(mockBillingStatus);
        });

        it('should throw error on API failure', async () => {
            mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(service.fetchBillingStatus()).rejects.toThrow('Unauthorized');
        });
    });

    describe('fetchPlans', () => {
        it('should fetch and return plans', async () => {
            mockApiClient.get.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockPlans },
            });

            const result = await service.fetchPlans();

            expect(mockApiClient.get).toHaveBeenCalledWith('/api/billing/plans');
            expect(result).toEqual(mockPlans);
        });

        it('should throw error on API failure', async () => {
            mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));
            await expect(service.fetchPlans()).rejects.toThrow('Unauthorized');
        });
    });

    describe('createCheckout', () => {
        it('should create a checkout session and return response', async () => {
            const request: CheckoutRequest = {
                planId: 'plan-team',
                interval: 'YEARLY',
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            };
            const mockResponse: CheckoutResponse = {
                sessionId: 'cs_test_123',
                url: 'https://checkout.stripe.com/session/cs_test_123',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockResponse },
            });

            const result = await service.createCheckout(request);

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/checkout', request);
            expect(result).toEqual(mockResponse);
        });

        it('should throw error on API failure', async () => {
            mockApiClient.post.mockRejectedValue(new Error('Bad Request'));
            await expect(service.createCheckout({
                planId: 'plan-team',
                interval: 'MONTHLY',
                successUrl: '',
                cancelUrl: '',
            })).rejects.toThrow('Bad Request');
        });
    });

    describe('createPortalSession', () => {
        it('should create a portal session and return response', async () => {
            const mockResponse: PortalResponse = {
                url: 'https://billing.stripe.com/session/bps_test_123',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: mockResponse },
            });

            const result = await service.createPortalSession({ returnUrl: 'https://example.com/workspace' });

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/portal', { returnUrl: 'https://example.com/workspace' });
            expect(result).toEqual(mockResponse);
        });

        it('should throw error on API failure', async () => {
            mockApiClient.post.mockRejectedValue(new Error('Forbidden'));
            await expect(service.createPortalSession({ returnUrl: '' })).rejects.toThrow('Forbidden');
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel subscription and return updated subscription', async () => {
            const cancelledSubscription: Subscription = {
                status: 'CANCELED',
                planId: 'plan-pro',
                currentPeriodStart: '2024-01-01T00:00:00Z',
                currentPeriodEnd: '2024-02-01T00:00:00Z',
                cancelAtPeriodEnd: true,
                canceledAt: '2024-01-15T00:00:00Z',
            };

            mockApiClient.post.mockResolvedValue({
                data: { status: 'SUCCESS', data: cancelledSubscription },
            });

            const result = await service.cancelSubscription();

            expect(mockApiClient.post).toHaveBeenCalledWith('/api/billing/cancel');
            expect(result).toEqual(cancelledSubscription);
            expect(result.status).toBe('CANCELED');
            expect(result.canceledAt).toBe('2024-01-15T00:00:00Z');
        });

        it('should throw error on API failure', async () => {
            mockApiClient.post.mockRejectedValue(new Error('Forbidden'));
            await expect(service.cancelSubscription()).rejects.toThrow('Forbidden');
        });
    });
});
