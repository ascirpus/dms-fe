import { ref } from 'vue'
import type { DocumentApproval, SignatureStatus } from "@/types";
import { useMutation, useQueryClient } from "vue-query";
import { useAuth } from "@/composables/useAuth.ts";
import { DocumentsService } from "@/services/DocumentsService.ts";

type ApprovalMutationParams = {
    projectId: string;
    documentId: string;
};

type DeclineMutationParams = ApprovalMutationParams & {
    comment?: string;
};

const approvals = ref<DocumentApproval[]>([]);
const signatureStatus = ref<SignatureStatus | null>(null);

export function useApprovals() {
    const { apiClient } = useAuth();
    const documentsService = new DocumentsService(apiClient);
    const queryClient = useQueryClient();

    async function fetchApprovals(projectId: string, documentId: string): Promise<DocumentApproval[]> {
        await queryClient.fetchQuery<DocumentApproval[]>({
            queryKey: [`approvals-${projectId}-${documentId}`],
            queryFn: async () => await documentsService.getApprovals(projectId, documentId),
        }).then((response: DocumentApproval[]) => {
            approvals.value = response;
        });
        return approvals.value;
    }

    async function fetchSignatureStatus(projectId: string, documentId: string): Promise<SignatureStatus | null> {
        await queryClient.fetchQuery<SignatureStatus>({
            queryKey: [`signatures-${projectId}-${documentId}`],
            queryFn: async () => await documentsService.getSignatureStatus(projectId, documentId),
        }).then((response: SignatureStatus) => {
            signatureStatus.value = response;
        });
        return signatureStatus.value;
    }

    const approveMutation = useMutation({
        mutationFn: async (params: ApprovalMutationParams): Promise<void> =>
            await documentsService.approveDocument(params.projectId, params.documentId),
        onSuccess: (_, params: ApprovalMutationParams) => {
            queryClient.invalidateQueries([`approvals-${params.projectId}-${params.documentId}`]);
            queryClient.invalidateQueries([`document-${params.projectId}-${params.documentId}`]);
        },
    });

    const declineMutation = useMutation({
        mutationFn: async (params: DeclineMutationParams): Promise<void> =>
            await documentsService.declineDocument(params.projectId, params.documentId, params.comment),
        onSuccess: (_, params: DeclineMutationParams) => {
            queryClient.invalidateQueries([`approvals-${params.projectId}-${params.documentId}`]);
            queryClient.invalidateQueries([`document-${params.projectId}-${params.documentId}`]);
        },
    });

    const signMutation = useMutation({
        mutationFn: async (params: ApprovalMutationParams): Promise<void> =>
            await documentsService.signDocument(params.projectId, params.documentId),
        onSuccess: (_, params: ApprovalMutationParams) => {
            queryClient.invalidateQueries([`signatures-${params.projectId}-${params.documentId}`]);
            queryClient.invalidateQueries([`document-${params.projectId}-${params.documentId}`]);
        },
    });

    function approveDocument(projectId: string, documentId: string) {
        return approveMutation.mutateAsync({ projectId, documentId });
    }

    function declineDocument(projectId: string, documentId: string, comment?: string) {
        return declineMutation.mutateAsync({ projectId, documentId, comment });
    }

    function signDocument(projectId: string, documentId: string) {
        return signMutation.mutateAsync({ projectId, documentId });
    }

    return {
        approvals,
        signatureStatus,
        fetchApprovals,
        fetchSignatureStatus,
        approveDocument,
        declineDocument,
        signDocument,
    };
}
