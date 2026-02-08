import { ApiService } from '@/services/ApiService';
import type { Tenant, UserTenantsResponse } from '@/types';

export class TenantService extends ApiService<Tenant> {
    async fetchTenant(): Promise<Tenant> {
        return this.fetch('/api/tenants/current');
    }

    async fetchUserTenants(): Promise<UserTenantsResponse> {
        const response = await this.apiClient.get<{ status: string; data: UserTenantsResponse }>('/api/tenants');
        return response.data.data;
    }

    async selectTenant(tenantId: string): Promise<void> {
        await this.apiClient.put('/api/me/active-tenant', { tenantId });
    }

    async createWorkspace(name: string): Promise<Tenant> {
        const response = await this.apiClient.post<{ status: string; data: Tenant }>('/api/tenants', { name });
        return response.data.data;
    }
}
