import { useQuery, useQueryClient, useMutation } from 'vue-query';
import { useAuth } from '@/composables/useAuth';
import { DocumentTypesService } from '@/services/DocumentTypesService';
import type { DocumentTypeDTO, CreateDocumentTypeRequest, UpdateDocumentTypeRequest } from '@/types/DocumentType';

export function useDocumentTypes() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const api = new DocumentTypesService(apiClient);

  const {
    data: documentTypes,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<DocumentTypeDTO[]>({
    queryKey: ['documentTypes'],
    queryFn: () => api.fetchAll(),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDocumentTypeRequest) => api.create(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries(['documentTypes']);
      const previous = queryClient.getQueryData<DocumentTypeDTO[]>(['documentTypes']);

      const optimistic: DocumentTypeDTO = {
        id: `temp-${Date.now()}`,
        name: newData.name,
        requiresApproval: newData.requiresApproval ?? false,
        defaultApprovalThreshold: newData.defaultApprovalThreshold ?? 0,
        requiresSignature: newData.requiresSignature ?? false,
        defaultPermissions: newData.defaultPermissions ?? 1,
        meta: newData.meta ?? {},
      };

      queryClient.setQueryData<DocumentTypeDTO[]>(['documentTypes'], (old) => {
        return [...(old ?? []), optimistic];
      });

      return { previous };
    },
    onSuccess: (created) => {
      queryClient.setQueryData<DocumentTypeDTO[]>(['documentTypes'], (old) => {
        if (!old) return [created];
        return old.map(dt => dt.id.startsWith('temp-') ? created : dt);
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['documentTypes'], context.previous);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentTypeRequest }) => api.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries(['documentTypes']);
      const previous = queryClient.getQueryData<DocumentTypeDTO[]>(['documentTypes']);

      queryClient.setQueryData<DocumentTypeDTO[]>(['documentTypes'], (old) => {
        if (!old) return [];
        return old.map(dt => dt.id === id ? { ...dt, ...data } : dt);
      });

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<DocumentTypeDTO[]>(['documentTypes'], (old) => {
        if (!old) return [updated];
        return old.map(dt => dt.id === updated.id ? updated : dt);
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['documentTypes'], context.previous);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['documentTypes']);
      const previous = queryClient.getQueryData<DocumentTypeDTO[]>(['documentTypes']);

      queryClient.setQueryData<DocumentTypeDTO[]>(['documentTypes'], (old) => {
        if (!old) return [];
        return old.filter(dt => dt.id !== id);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['documentTypes'], context.previous);
      }
    },
  });

  return {
    documentTypes,
    loading,
    error,
    refetch,
    createDocumentType: createMutation.mutateAsync,
    updateDocumentType: (id: string, data: UpdateDocumentTypeRequest) =>
      updateMutation.mutateAsync({ id, data }),
    deleteDocumentType: deleteMutation.mutateAsync,
  };
}
