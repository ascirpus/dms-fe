import type { Comment } from "@/types";
import { CommentMapper } from "@/mappers";
import type { CommentRequest } from "@/types/requests";
import type { ApiResponse } from "@/types/response";
import { ApiService } from "@/services/ApiService.ts";

export class CommentService extends ApiService<Comment> {

    async fetchComments(documentId: string): Promise<Comment[]> {
        return this.fetchAll(`/api/documents/${documentId}/comments`)
    }

    async createComment(commentRequest: CommentRequest): Promise<Comment> {
        return await this.apiClient.post<ApiResponse<Comment>>(
            `/api/documents/${commentRequest.documentId}/comments`,
            commentRequest
        ).then(response => {
            return CommentMapper.fromResponse(response.data);
        }).catch(error => {
            const message = `[${error.status}] Error creating comment: ${error.statusText}`;
            console.error(message);
            throw new Error(message);
        });
    }

    async resolveComment(documentId: string, commentId: string): Promise<Comment> {
        try {
            const response = await this.apiClient.patch<ApiResponse<Comment>>(
                `/api/documents/${documentId}/comments/${commentId}/resolve`,
                {}
            );

            return CommentMapper.fromResponse(response.data);
        } catch (error) {
            console.error(`Error resolving comment: ${error}`);
            throw error;
        }
    }
}