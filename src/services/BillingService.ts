import { ApiService } from './ApiService';
import type { BillingStatus, BillingPlan, Subscription, CheckoutRequest, CheckoutResponse, PortalRequest, PortalResponse } from '@/types';

export class BillingService extends ApiService<BillingStatus> {
    async fetchBillingStatus(): Promise<BillingStatus> {
        return this.fetch('/api/billing/status');
    }

    async fetchPlans(): Promise<BillingPlan[]> {
        return this.fetchAll('/api/billing/plans') as Promise<BillingPlan[]>;
    }

    async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        const response = await this.apiClient.post<{ status: string; data: CheckoutResponse }>(
            '/api/billing/checkout',
            request
        );
        return response.data.data;
    }

    async createPortalSession(request: PortalRequest): Promise<PortalResponse> {
        const response = await this.apiClient.post<{ status: string; data: PortalResponse }>(
            '/api/billing/portal',
            request
        );
        return response.data.data;
    }

    async cancelSubscription(): Promise<Subscription> {
        const response = await this.apiClient.post<{ status: string; data: Subscription }>(
            '/api/billing/cancel'
        );
        return response.data.data;
    }
}
