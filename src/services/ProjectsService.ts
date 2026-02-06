import type { Project } from "@/types/Project.ts";
import type { Document } from "@/types/Document.ts";
import { ApiService } from "@/services/ApiService.ts";
import type { ApiResponse } from "@/types/response";
import type { TenantUser } from "@/services/UsersService.ts";

export interface ProjectListItem {
    project: Project;
    document_count: number;
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
        const response = await this.apiClient.get<ApiResponse<Document[]>>(`/api/projects/${projectId}/documents`);
        return response.data.data;
    }

    async createProject(data: { name: string; description: string }): Promise<Project> {
        const response = await this.apiClient.post<ApiResponse<Project>>('/api/projects', data);
        return response.data.data;
    }

    async deleteProject(projectId: string): Promise<void> {
        await this.apiClient.delete(`/api/projects/${projectId}`);
    }

    async fetchProjectMembers(projectId: string): Promise<TenantUser[]> {
        const response = await this.apiClient.get<ApiResponse<TenantUser[]>>(`/api/projects/${projectId}/members`);
        return response.data.data;
    }
}
