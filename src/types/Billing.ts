export type BillingInterval = 'MONTHLY' | 'YEARLY';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE';

export interface BillingPlanPrice {
    interval: BillingInterval;
    priceInCents: number;
}

export interface BillingPlan {
    id: string;
    name: string;
    currency: string;
    prices: BillingPlanPrice[];
}

export interface Subscription {
    status: SubscriptionStatus;
    planId: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    gracePeriodEndsAt?: string;
    cancelAtPeriodEnd: boolean;
    canceledAt?: string;
}

export interface BillingStatus {
    subscription?: Subscription;
    currentPlan?: BillingPlan;
    availablePlans: BillingPlan[];
}

export interface CheckoutRequest {
    planId: string;
    interval: BillingInterval;
    successUrl: string;
    cancelUrl: string;
}

export interface CheckoutResponse {
    sessionId: string;
    url: string;
}

export interface PortalRequest {
    returnUrl: string;
}

export interface PortalResponse {
    url: string;
}
