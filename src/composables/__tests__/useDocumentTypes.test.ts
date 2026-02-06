import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDocumentTypes } from '../useDocumentTypes';
import { useAuth } from '../useAuth';
import { useQuery, useQueryClient, useMutation } from 'vue-query';
import type { DocumentTypeDTO } from '@/types/DocumentType';
import { ref } from 'vue';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  useMutation: vi.fn(),
}));

describe('useDocumentTypes', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  const mockTypes: DocumentTypeDTO[] = [
    {
      id: 'dt-1',
      name: 'Invoice',
      requiresApproval: true,
      defaultApprovalThreshold: 2,
      requiresSignature: false,
      defaultPermissions: 1,
    },
    {
      id: 'dt-2',
      name: 'Contract',
      requiresApproval: false,
      defaultApprovalThreshold: 0,
      requiresSignature: true,
      defaultPermissions: 3,
    },
  ];

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      setQueryData: vi.fn(),
      getQueryData: vi.fn(),
      cancelQueries: vi.fn(),
      invalidateQueries: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);

    vi.mocked(useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  describe('Query functionality', () => {
    it('should load document types with useQuery', () => {
      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { documentTypes, loading, error } = useDocumentTypes();

      expect(documentTypes.value).toEqual(mockTypes);
      expect(loading.value).toBe(false);
      expect(error.value).toBeNull();
    });

    it('should show loading state', () => {
      vi.mocked(useQuery).mockReturnValue({
        data: ref(null),
        isLoading: ref(true),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { documentTypes, loading } = useDocumentTypes();

      expect(documentTypes.value).toBeNull();
      expect(loading.value).toBe(true);
    });

    it('should handle error state', () => {
      const mockError = new Error('Failed to fetch');

      vi.mocked(useQuery).mockReturnValue({
        data: ref(null),
        isLoading: ref(false),
        error: ref(mockError),
        refetch: vi.fn(),
      } as any);

      const { documentTypes, error } = useDocumentTypes();

      expect(documentTypes.value).toBeNull();
      expect(error.value).toEqual(mockError);
    });
  });

  describe('createDocumentType', () => {
    it('should call mutateAsync with create data', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue({
        id: 'dt-new',
        name: 'New Type',
        requiresApproval: false,
        defaultApprovalThreshold: 0,
        requiresSignature: false,
        defaultPermissions: 1,
      });

      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { createDocumentType } = useDocumentTypes();
      await createDocumentType({ name: 'New Type' });

      expect(mockMutateAsync).toHaveBeenCalledWith({ name: 'New Type' });
    });

    it('should add created type to cache optimistically', async () => {
      const mutationConfigs: any[] = [];

      vi.mocked(useMutation).mockImplementation((config: any) => {
        mutationConfigs.push(config);
        return { mutateAsync: vi.fn() } as any;
      });

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      useDocumentTypes();

      // First mutation is create
      const createConfig = mutationConfigs[0];
      expect(createConfig.onMutate).toBeDefined();

      mockQueryClient.getQueryData.mockReturnValue(mockTypes);
      mockQueryClient.cancelQueries.mockResolvedValue(undefined);
      await createConfig.onMutate({ name: 'New Type' });

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['documentTypes'],
        expect.any(Function)
      );
    });
  });

  describe('updateDocumentType', () => {
    it('should call mutateAsync with id and update data', async () => {
      const updated: DocumentTypeDTO = {
        ...mockTypes[0],
        name: 'Updated Invoice',
      };

      const mockMutateAsync = vi.fn().mockResolvedValue(updated);

      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { updateDocumentType } = useDocumentTypes();
      await updateDocumentType('dt-1', { name: 'Updated Invoice' });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: 'dt-1',
        data: { name: 'Updated Invoice' },
      });
    });
  });

  describe('deleteDocumentType', () => {
    it('should call mutateAsync with id', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { deleteDocumentType } = useDocumentTypes();
      await deleteDocumentType('dt-1');

      expect(mockMutateAsync).toHaveBeenCalledWith('dt-1');
    });

    it('should remove deleted type from cache optimistically', async () => {
      const mutationConfigs: any[] = [];

      vi.mocked(useMutation).mockImplementation((config: any) => {
        mutationConfigs.push(config);
        return { mutateAsync: vi.fn() } as any;
      });

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      useDocumentTypes();

      // Third mutation is delete (create=0, update=1, delete=2)
      const deleteConfig = mutationConfigs[2];
      expect(deleteConfig.onMutate).toBeDefined();

      mockQueryClient.getQueryData.mockReturnValue(mockTypes);
      mockQueryClient.cancelQueries.mockResolvedValue(undefined);
      await deleteConfig.onMutate('dt-1');

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['documentTypes'],
        expect.any(Function)
      );
    });

    it('should rollback on delete error', () => {
      const mutationConfigs: any[] = [];

      vi.mocked(useMutation).mockImplementation((config: any) => {
        mutationConfigs.push(config);
        return { mutateAsync: vi.fn() } as any;
      });

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockTypes),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      useDocumentTypes();

      // Third mutation is delete
      const deleteConfig = mutationConfigs[2];
      expect(deleteConfig.onError).toBeDefined();

      const context = { previous: mockTypes };
      deleteConfig.onError(new Error('In use'), 'dt-1', context);

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['documentTypes'],
        mockTypes
      );
    });
  });
});
