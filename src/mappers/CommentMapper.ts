import type { Comment } from '@/types';
import type { CommentRequest, MarkerRequest } from '@/types/requests';
import type { ApiResponse } from "@/types/response";

export class CommentMapper {

    static toRequest(fileId: string, comment: string, marker?: MarkerRequest | null): CommentRequest {
        const request: CommentRequest = {
            fileId,
            comment,
        };

        if (marker) {
            request.marker = marker;
        }

        return request;
    }

    static fromResponse(response: ApiResponse<Comment>): Comment {
        return response.data;
    }
}