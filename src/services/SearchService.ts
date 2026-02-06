import type { SearchResultDTO } from '@/types/Search';
import { ApiService } from '@/services/ApiService';
import type { ApiResponse } from '@/types/response';

export class SearchService extends ApiService<SearchResultDTO> {

  async search(query: string, projectId?: string): Promise<SearchResultDTO[]> {
    const params: Record<string, string> = { q: query };
    if (projectId) {
      params.projectId = projectId;
    }
    const response = await this.apiClient.get<ApiResponse<SearchResultDTO[]>>('/api/search', { params });
    return response.data.data;
  }
}
