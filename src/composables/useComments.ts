import { ref } from 'vue'
import type { Comment } from "@/types";
import { useMutation, useQueryClient } from "vue-query";
import { CommentMapper } from "@/mappers";
import type { CommentRequest } from "@/types/requests";
import { useAuth } from "@/composables/useAuth.ts";
import { CommentService } from "@/services/CommentsService.ts";

type MutationParams = {
    projectId: string,
    documentId: string,
    commentId: string
}

// Persist comments across components
const comments = ref<Comment[]>([]);

export function useComments() {

    const { apiClient } = useAuth();
    const commentService = new CommentService(apiClient);
    const queryClient = useQueryClient();

    async function fetchComments(projectId: string, documentId: string): Promise<Comment[]> {
        await queryClient.fetchQuery<Comment[]>({
            queryKey: [`comments-${projectId}-${documentId}`],
            queryFn: async () => await commentService.fetchComments(projectId, documentId)
        }).then((response: Comment[]) => {
            comments.value = response;
        });

        return comments.value
    }

    const resolveCommentMutation = useMutation({
        mutationFn: async (params: MutationParams): Promise<void> =>
            await commentService.resolveComment(params.projectId, params.documentId, params.commentId),
        onSuccess: (_, params: MutationParams) => {
            const { commentId, projectId, documentId } = params;
            const comment = comments.value.find(c => c.id === commentId);
            if (comment) {
                comment.isResolved = true;
            }

            queryClient.invalidateQueries([`comments-${projectId}-${documentId}`]);
        }
    });

    function resolveComment(projectId: string, comment: Comment) {
        return resolveCommentMutation.mutateAsync({ projectId, commentId: comment.id, documentId: comment.documentId });
    }

    type CreateCommentParams = {
        projectId: string;
        documentId: string;
        request: CommentRequest;
    };

    const createCommentMutation = useMutation({
        mutationFn: async (params: CreateCommentParams): Promise<Comment> =>
            await commentService.createComment(params.projectId, params.documentId, params.request),
        onSuccess: (comment) => {
            comments.value.push(comment)
        }
    });

    function addComment(
        projectId: string,
        documentId: string,
        fileId: string,
        fileVersion: number,
        comment: string,
        marker: { pageNumber: number, position: { x: number, y: number } } | null,
    ) {
        const request = CommentMapper.toRequest(fileId, fileVersion, comment, marker);
        return createCommentMutation.mutateAsync({ projectId, documentId, request });
    }

    function getCommentsByDocumentId(documentId: string) {
        return comments.value.filter(marker => marker.documentId === documentId);
    }

    function  getMarkersByPage(documentId: string, pageNumber: number) {
        return comments.value.filter(
            comment => comment.documentId === documentId && comment.marker?.pageNumber === pageNumber
        );
    }

    function getUnresolvedComments(documentId: string) {
        return comments.value.filter(
            comment => comment.documentId === documentId && !comment.isResolved
        );
    }

    return {
        comments,
        addComment,
        resolveComment,
        fetchComments,
        getCommentsByDocumentId,
        getMarkersByPage,
        getUnresolvedComments
    }
}