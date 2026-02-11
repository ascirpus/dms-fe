import type { Document } from "@/types";
import { ApiService } from "@/services/ApiService.ts";
import type { ApiResponse } from "@/types/response";

export class DocumentsService extends ApiService<Document> {

    async fetchDocumentById(projectId: string, documentId: string): Promise<Document> {
        return this.fetch(`/api/projects/${projectId}/documents/${documentId}`)
    }

    async approveDocument(projectId: string, documentId: string): Promise<void> {
        await this.apiClient.post(`/api/projects/${projectId}/documents/${documentId}/approve`, {});
    }

    async uploadDocument(
        projectId: string,
        file: File,
        metadata: { title: string; document_type_id: string; document_id?: string; password?: string },
    ): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

        const response = await this.apiClient.post<ApiResponse<Document>>(
            `/api/projects/${projectId}/documents`,
            formData,
        );
        return response.data.data;
    }

    async uploadVersion(
        projectId: string,
        documentId: string,
        file: File,
        metadata: { title: string; document_type_id: string; password?: string },
    ): Promise<Document> {
        return this.uploadDocument(projectId, file, {
            ...metadata,
            document_id: documentId,
        });
    }

}