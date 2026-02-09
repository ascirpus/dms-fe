export interface RegisterCompanyRequest {
    email: string;
    tenantName: string;
    firstName?: string;
    lastName?: string;
    captchaToken?: string;
    checkout?: {
        planId: string;
        interval: string;
    };
}

export interface RegistrationResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    tenantId: string;
    checkoutUrl?: string;
}

export interface RegistrationErrorResponse {
    status: string;
    error: {
        code: string;
        message: string;
    };
}
