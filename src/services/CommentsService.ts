import type { Comment } from "@/types";
import { CommentMapper } from "@/mappers";
import type { CommentRequest } from "@/types/requests";
import type { ApiResponse } from "@/types/response";
import { ApiService } from "@/services/ApiService.ts";

export class CommentService extends ApiService<Comment> {

    async fetchComments(projectId: string, documentId: string): Promise<Comment[]> {
        return this.fetchAll(`/api/projects/${projectId}/documents/${documentId}/comments`)
    }

    async createComment(projectId: string, documentId: string, commentRequest: CommentRequest): Promise<Comment> {
        return await this.apiClient.post<ApiResponse<Comment>>(
            `/api/projects/${projectId}/documents/${documentId}/comments`,
            commentRequest
        ).then(response => {
            return CommentMapper.fromResponse(response.data);
        }).catch(error => {
            const message = `[${error.status}] Error creating comment: ${error.statusText}`;
            console.error(message);
            throw new Error(message);
        });
    }

    async resolveComment(projectId: string, documentId: string, commentId: string): Promise<void> {
        try {
            await this.apiClient.post<ApiResponse<void>>(
                `/api/projects/${projectId}/documents/${documentId}/comments/${commentId}/resolve`,
                {}
            );
        } catch (error) {
            console.error(`Error resolving comment: ${error}`);
            throw error;
        }
    }
}