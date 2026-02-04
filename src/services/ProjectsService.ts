import type { Project } from "@/types/Project.ts";
import type { Document } from "@/types/Document.ts";
import { ApiService } from "@/services/ApiService.ts";
import type { ApiResponse } from "@/types/response";

export interface ProjectListItem {
    project: Project;
    document_count: number;
}

// API response for documents (may have fewer fields than full Document type)
interface ApiDocument {
    id: string;
    title: string;
    content: string;
    status: string;
}

export class ProjectsService extends ApiService<Project> {

    async fetchProjects(): Promise<ProjectListItem[]> {
        const response = await this.apiClient.get<ApiResponse<ProjectListItem[]>>('/api/projects');
        return response.data.data;
    }

    async fetchProjectById(projectId: string): Promise<Project> {
        return this.fetch(`/api/projects/${projectId}`);
    }

    async fetchProjectDocuments(projectId: string): Promise<Document[]> {
        const response = await this.apiClient.get<ApiResponse<ApiDocument[]>>(`/api/projects/${projectId}/documents`);
        return response.data.data.map(doc => ({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            status: doc.status as any,
            version: 1,
            updatedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        })) as Document[];
    }

    async createProject(data: { name: string; description: string }): Promise<Project> {
        const response = await this.apiClient.post<ApiResponse<Project>>('/api/projects', data);
        return response.data.data;
    }

    async deleteProject(projectId: string): Promise<void> {
        await this.apiClient.delete(`/api/projects/${projectId}`);
    }

    async uploadDocument(
        projectId: string,
        file: File,
        metadata: { title: string; document_type: string }
    ): Promise<Document> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

        const response = await this.apiClient.post<ApiResponse<ApiDocument>>(
            `/api/projects/${projectId}/documents`,
            formData
        );

        const doc = response.data.data;
        return {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            status: doc.status as any,
            version: 1,
            updatedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Document;
    }
}
