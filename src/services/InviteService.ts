import axios, { type AxiosInstance } from 'axios';
import { ApiService } from './ApiService';
import type { ApiResponse } from '@/types/response';
import type { TenantInvite, UserPendingInvite, CreateInviteRequest, AcceptedInvite, JoinTenantRequest } from '@/types';

const API_URL = import.meta.env.VITE_DOCUMENT_STORE_URL;

export class InviteService extends ApiService<TenantInvite> {
  private plainClient: AxiosInstance;

  constructor(apiClient: AxiosInstance) {
    super(apiClient);
    this.plainClient = axios.create({ baseURL: API_URL });
  }

  async createInvite(request: CreateInviteRequest): Promise<TenantInvite> {
    const response = await this.apiClient.post<ApiResponse<TenantInvite>>(
      '/api/tenants/current/invites',
      request,
    );
    return response.data.data;
  }

  async listPendingInvites(): Promise<TenantInvite[]> {
    const response = await this.apiClient.get<ApiResponse<TenantInvite[]>>(
      '/api/tenants/current/invites',
    );
    return response.data.data;
  }

  async cancelInvite(inviteId: string): Promise<void> {
    await this.apiClient.delete(`/api/tenants/current/invites/${inviteId}`);
  }

  async listUserPendingInvites(): Promise<UserPendingInvite[]> {
    const response = await this.apiClient.get<ApiResponse<UserPendingInvite[]>>(
      '/api/tenants/invites/pending',
    );
    return response.data.data;
  }

  async acceptInvite(inviteId: string): Promise<AcceptedInvite> {
    const response = await this.apiClient.post<ApiResponse<AcceptedInvite>>(
      `/api/tenants/invites/${inviteId}/accept`,
    );
    return response.data.data;
  }

  async joinTenant(request: JoinTenantRequest): Promise<void> {
    await this.plainClient.post('/api/users/join', request);
  }
}
