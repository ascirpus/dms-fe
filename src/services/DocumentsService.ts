import type { Document } from "@/types";
import { ApiService } from "@/services/ApiService.ts";

export class DocumentsService extends ApiService<Document> {

    async fetchDocuments(): Promise<Document[]> {
        return this.fetchAll('/api/documents')
    }

    async fetchDocumentById(documentId: string): Promise<Document> {
        return this.fetch(`/api/documents/${documentId}`)
    }
}