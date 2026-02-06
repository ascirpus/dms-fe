import type { DocumentTypeDTO, CreateDocumentTypeRequest, UpdateDocumentTypeRequest } from '@/types/DocumentType';
import { ApiService } from '@/services/ApiService';
import type { ApiResponse } from '@/types/response';

export class DocumentTypesService extends ApiService<DocumentTypeDTO> {

    async fetchAll(): Promise<DocumentTypeDTO[]> {
        const response = await this.apiClient.get<ApiResponse<DocumentTypeDTO[]>>('/api/document-types');
        return response.data.data;
    }

    async fetchById(id: string): Promise<DocumentTypeDTO> {
        const response = await this.apiClient.get<ApiResponse<DocumentTypeDTO>>(`/api/document-types/${id}`);
        return response.data.data;
    }

    async create(data: CreateDocumentTypeRequest): Promise<DocumentTypeDTO> {
        const response = await this.apiClient.post<ApiResponse<DocumentTypeDTO>>('/api/document-types', data);
        return response.data.data;
    }

    async update(id: string, data: UpdateDocumentTypeRequest): Promise<DocumentTypeDTO> {
        const response = await this.apiClient.put<ApiResponse<DocumentTypeDTO>>(`/api/document-types/${id}`, data);
        return response.data.data;
    }

    async delete(id: string): Promise<void> {
        await this.apiClient.delete(`/api/document-types/${id}`);
    }
}
