import { ref, type Ref } from "vue";
import { useQueryClient } from "vue-query";
import type { Document } from "@/types";
import { useAuth } from "@/composables/useAuth.ts";
import { DocumentsService } from "@/services/DocumentsService.ts";

export function useDocuments(elementRef: Ref<HTMLElement | null>) {

    const queryClient = useQueryClient();

    const currentDocument = ref<Document | null>(null)

    const { apiClient } = useAuth();
    const documentsService = new DocumentsService(apiClient);

    async function getDocumentById(projectId: string, documentId: string) {
        const response = await queryClient.fetchQuery<Document>({
            queryKey: [`projects-${projectId}-documents-${documentId}`],
            queryFn: async () => await documentsService.fetchDocumentById(projectId, documentId)
        });

        currentDocument.value = response;
        return response;
    }

    return {
        currentDocument,
        getDocumentById,
    }
}