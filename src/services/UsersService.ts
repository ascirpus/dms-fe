import { ApiService } from "@/services/ApiService";
import type { ApiResponse } from "@/types/response";

interface TenantUserResponseDTO {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        picture?: string;
    };
    role: 'MEMBER' | 'ADMIN' | 'OWNER';
    createdAt: string;
}

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
        const response = await this.apiClient.get<ApiResponse<TenantUserResponseDTO[]>>('/api/tenants/current/users');
        return response.data.data.map(dto => ({
            userId: dto.user.id,
            email: dto.user.email,
            firstName: dto.user.firstName || undefined,
            lastName: dto.user.lastName || undefined,
            role: dto.role,
            createdAt: dto.createdAt,
        }));
    }

    async removeTenantUser(userId: string): Promise<void> {
        await this.apiClient.delete(`/api/tenants/current/users/${userId}`);
    }
}
