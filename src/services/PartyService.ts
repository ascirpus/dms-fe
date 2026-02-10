import { ApiService } from './ApiService';
import type { ApiResponse } from '@/types/response';
import type {
  PartyDTO,
  ProjectPartyMembers,
  PartyPermissionsDTO,
  CreatePartyRequest,
  PermissionAction,
} from '@/types';

export class PartyService extends ApiService<PartyDTO> {

  async fetchProjectParties(projectId: string): Promise<ProjectPartyMembers> {
    const response = await this.apiClient.get<ApiResponse<ProjectPartyMembers>>(
      `/api/projects/${projectId}/party`,
    );
    return response.data.data;
  }

  async createParty(projectId: string, data: CreatePartyRequest): Promise<PartyDTO> {
    const response = await this.apiClient.post<ApiResponse<PartyDTO>>(
      `/api/projects/${projectId}/party`,
      data,
    );
    return response.data.data;
  }

  async deleteParty(projectId: string, partyId: string): Promise<void> {
    await this.apiClient.delete(`/api/projects/${projectId}/party/${partyId}`);
  }

  async addMember(projectId: string, partyId: string, userId: string): Promise<void> {
    await this.apiClient.post(
      `/api/projects/${projectId}/party/${partyId}/members`,
      { user_id: userId },
    );
  }

  async removeMember(projectId: string, partyId: string, userId: string): Promise<void> {
    await this.apiClient.delete(
      `/api/projects/${projectId}/party/${partyId}/members`,
      { data: { user_id: userId } },
    );
  }

  async getPermissions(projectId: string): Promise<PartyPermissionsDTO[]> {
    const response = await this.apiClient.get<ApiResponse<PartyPermissionsDTO[]>>(
      `/api/projects/${projectId}/party/permissions`,
    );
    return response.data.data;
  }

  async setPermissions(
    projectId: string,
    partyId: string,
    permissions: Record<string, PermissionAction>,
  ): Promise<void> {
    await this.apiClient.post(
      `/api/projects/${projectId}/party/${partyId}/permission`,
      { permissions },
    );
  }

  async removePermissions(projectId: string, partyId: string): Promise<void> {
    await this.apiClient.delete(
      `/api/projects/${projectId}/party/${partyId}/permission`,
    );
  }
}
