import type { Document } from "@/types";
import { ApiService } from "@/services/ApiService.ts";

export class DocumentsService extends ApiService<Document> {

    async fetchDocumentById(projectId: string, documentId: string): Promise<Document> {
        return this.fetch(`/api/projects/${projectId}/documents/${documentId}`)
    }
}