import { ApiService } from "@/services/ApiService";
import type { ApiResponse } from "@/types/response";

export interface TenantUser {
    userId: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: 'MEMBER' | 'ADMIN' | 'OWNER';
    createdAt: string;
}

export class UsersService extends ApiService<TenantUser> {
    async fetchTenantUsers(): Promise<TenantUser[]> {
        const response = await this.apiClient.get<ApiResponse<TenantUser[]>>('/api/tenants/current/users');
        return response.data.data;
    }
}
