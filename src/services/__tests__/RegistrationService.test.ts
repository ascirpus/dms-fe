import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import { RegistrationService } from '../RegistrationService';
import type { RegisterCompanyRequest, RegistrationResponse } from '@/types';

describe('RegistrationService', () => {
    let service: RegistrationService;
    let mockClient: any;

    const mockResponse: RegistrationResponse = {
        user: {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
        },
        tenantId: 'tenant-456',
    };

    beforeEach(() => {
        mockClient = {
            post: vi.fn(),
        };
        service = new RegistrationService(mockClient);
    });

    it('should register with required fields only', async () => {
        mockClient.post.mockResolvedValue({
            data: { status: 'SUCCESS', data: mockResponse },
        });

        const request: RegisterCompanyRequest = {
            email: 'test@example.com',
            password: 'password123',
            tenantName: 'Acme Corp',
        };

        const result = await service.registerCompany(request);

        expect(mockClient.post).toHaveBeenCalledWith('/api/users/register', request);
        expect(result).toEqual(mockResponse);
    });

    it('should register with all optional fields', async () => {
        mockClient.post.mockResolvedValue({
            data: { status: 'SUCCESS', data: mockResponse },
        });

        const request: RegisterCompanyRequest = {
            email: 'test@example.com',
            password: 'password123',
            tenantName: 'Acme Corp',
            firstName: 'John',
            lastName: 'Doe',
        };

        const result = await service.registerCompany(request);

        expect(mockClient.post).toHaveBeenCalledWith('/api/users/register', request);
        expect(result).toEqual(mockResponse);
    });

    it('should register with checkout data', async () => {
        const responseWithCheckout: RegistrationResponse = {
            ...mockResponse,
            checkoutUrl: 'https://checkout.stripe.com/session/cs_123',
        };

        mockClient.post.mockResolvedValue({
            data: { status: 'SUCCESS', data: responseWithCheckout },
        });

        const request: RegisterCompanyRequest = {
            email: 'test@example.com',
            password: 'password123',
            tenantName: 'Acme Corp',
            checkout: { planId: 'plan-team', interval: 'MONTHLY' },
        };

        const result = await service.registerCompany(request);

        expect(mockClient.post).toHaveBeenCalledWith('/api/users/register', request);
        expect(result.checkoutUrl).toBe('https://checkout.stripe.com/session/cs_123');
    });

    it('should throw on 409 USER_ALREADY_EXISTS', async () => {
        const axiosError = new AxiosError('Conflict', '409', undefined, undefined, {
            status: 409,
            data: { status: 'ERROR', error: { code: 'USER_ALREADY_EXISTS', message: 'User already exists' } },
            statusText: 'Conflict',
            headers: {},
            config: {} as any,
        });

        mockClient.post.mockRejectedValue(axiosError);

        await expect(service.registerCompany({
            email: 'existing@example.com',
            password: 'password123',
            tenantName: 'Acme Corp',
        })).rejects.toThrow('Conflict');
    });

    it('should throw on network error', async () => {
        mockClient.post.mockRejectedValue(new Error('Network Error'));

        await expect(service.registerCompany({
            email: 'test@example.com',
            password: 'password123',
            tenantName: 'Acme Corp',
        })).rejects.toThrow('Network Error');
    });
});
