import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjects, useProjectDocuments } from '../useProjects';
import { useAuth } from '../useAuth';
import { useQuery, useQueryClient, useMutation } from 'vue-query';
import type { Project } from '@/types/Project';
import type { ProjectListItem } from '@/services/ProjectsService';
import { ref } from 'vue';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  useMutation: vi.fn(),
}));

describe('useProjects', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);

    // Default useMutation mock
    vi.mocked(useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);
  });

  describe('Query functionality', () => {
    it('should load projects with useQuery', () => {
      const mockProjects: ProjectListItem[] = [
        {
          project: {
            id: 'proj-1',
            name: 'Project 1',
            description: 'Description 1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 5,
        },
      ];

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { projects, loading, error } = useProjects();

      expect(projects.value).toEqual(mockProjects);
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

      const { projects, loading } = useProjects();

      expect(projects.value).toBeNull();
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

      const { projects, loading, error } = useProjects();

      expect(projects.value).toBeNull();
      expect(loading.value).toBe(false);
      expect(error.value).toEqual(mockError);
    });
  });

  describe('fetchProjectById', () => {
    it('should fetch single project from cache', async () => {
      const mockProject: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockProject },
      });

      mockQueryClient.fetchQuery.mockResolvedValue(mockProject);

      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { fetchProjectById } = useProjects();
      const result = await fetchProjectById('proj-123');

      expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith({
        queryKey: ['projects', 'proj-123'],
        queryFn: expect.any(Function),
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('resolveProject', () => {
    it('should resolve project from URL slug', () => {
      const mockProjects: ProjectListItem[] = [
        {
          project: {
            id: 'abc12345-def456',
            name: 'Test Project',
            description: 'Description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 5,
        },
      ];

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { resolveProject } = useProjects();
      // URL slug format: "test-project-abc12345" - last 8 chars are extracted as short ID
      const result = resolveProject('test-project-abc12345');

      expect(result).toEqual(mockProjects[0]);
    });

    it('should return null when project not found', () => {
      const mockProjects: ProjectListItem[] = [
        {
          project: {
            id: 'abc123-def456',
            name: 'Test Project',
            description: 'Description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 5,
        },
      ];

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { resolveProject } = useProjects();
      const result = resolveProject('nonexistent-xyz789');

      expect(result).toBeNull();
    });

    it('should return null when projects not loaded', () => {
      vi.mocked(useQuery).mockReturnValue({
        data: ref(null),
        isLoading: ref(true),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { resolveProject } = useProjects();
      const result = resolveProject('test-project-abc123');

      expect(result).toBeNull();
    });
  });

  describe('resolveProjectId', () => {
    it('should resolve project ID from URL slug', () => {
      const mockProjects: ProjectListItem[] = [
        {
          project: {
            id: 'abc12345-def456',
            name: 'Test Project',
            description: 'Description',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 5,
        },
      ];

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { resolveProjectId } = useProjects();
      // URL slug format: "test-project-abc12345" - last 8 chars match start of ID
      const result = resolveProjectId('test-project-abc12345');

      expect(result).toBe('abc12345-def456');
    });

    it('should return null when project not found', () => {
      const mockProjects: ProjectListItem[] = [];

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { resolveProjectId } = useProjects();
      const result = resolveProjectId('nonexistent-xyz789');

      expect(result).toBeNull();
    });
  });

  describe('getProjectUrl', () => {
    it('should generate URL slug from project', () => {
      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const mockProject: Project = {
        id: 'abc123-def456',
        name: 'My Test Project',
        description: 'Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { getProjectUrl } = useProjects();
      const result = getProjectUrl(mockProject);

      expect(result).toContain('my-test-project');
      expect(result).toContain('abc123');
    });
  });

  describe('createProject', () => {
    it('should create project and update cache optimistically', async () => {
      const newProject: Project = {
        id: 'new-proj',
        name: 'New Project',
        description: 'New Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMutateAsync = vi.fn().mockResolvedValue(newProject);

      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { createProject } = useProjects();
      const result = await createProject({
        name: 'New Project',
        description: 'New Description',
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'New Description',
      });
      expect(result).toEqual(newProject);
    });

    it('should add created project to cache', async () => {
      const existingProjects: ProjectListItem[] = [
        {
          project: {
            id: 'proj-1',
            name: 'Existing',
            description: 'Desc',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 2,
        },
      ];

      const newProject: Project = {
        id: 'new-proj',
        name: 'New Project',
        description: 'New Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let mockSetQueryData: any;
      vi.mocked(useMutation).mockImplementation((config: any) => {
        mockSetQueryData = config.onSuccess;
        return {
          mutateAsync: vi.fn().mockResolvedValue(newProject),
        } as any;
      });

      vi.mocked(useQuery).mockReturnValue({
        data: ref(existingProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      useProjects();

      // Simulate onSuccess callback
      if (mockSetQueryData) {
        mockSetQueryData(newProject);
      }

      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        ['projects'],
        expect.any(Function)
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete project and update cache', async () => {
      const mockMutateAsync = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const { deleteProject } = useProjects();
      await deleteProject('proj-123');

      expect(mockMutateAsync).toHaveBeenCalledWith('proj-123');
    });

    it('should remove deleted project from cache', async () => {
      const existingProjects: ProjectListItem[] = [
        {
          project: {
            id: 'proj-1',
            name: 'Project 1',
            description: 'Desc',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 2,
        },
        {
          project: {
            id: 'proj-2',
            name: 'Project 2',
            description: 'Desc',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 3,
        },
      ];

      let mockSetQueryData: any;
      vi.mocked(useMutation).mockImplementation((config: any) => {
        if (config.mutationFn.toString().includes('deleteProject')) {
          mockSetQueryData = config.onSuccess;
        }
        return {
          mutateAsync: vi.fn().mockResolvedValue(undefined),
        } as any;
      });

      vi.mocked(useQuery).mockReturnValue({
        data: ref(existingProjects),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      useProjects();

      // Simulate onSuccess callback
      if (mockSetQueryData) {
        mockSetQueryData(undefined, 'proj-1');
      }

      expect(mockQueryClient.setQueryData).toHaveBeenCalled();
    });
  });
});

describe('useProjectDocuments', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      setQueryData: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
  });

  describe('Query functionality', () => {
    it('should load documents for a project', () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          title: 'Document 1',
          content: 'Content',
          status: 'PENDING' as any,
          version: 1,
          updatedDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(useQuery).mockReturnValue({
        data: ref(mockDocuments),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const projectId = () => 'proj-123';
      const { documents, loading } = useProjectDocuments(projectId);

      expect(documents.value).toEqual(mockDocuments);
      expect(loading.value).toBe(false);
    });

    it('should not load documents when projectId is null', () => {
      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const projectId = () => null;
      const { documents } = useProjectDocuments(projectId);

      expect(documents.value).toEqual([]);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document and update cache', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockUploadedDoc = {
        id: 'doc-new',
        title: 'Test Doc',
        content: 'Content',
        status: 'PENDING' as any,
        version: 1,
        updatedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMutateAsync = vi.fn().mockResolvedValue(mockUploadedDoc);

      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: mockMutateAsync,
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const projectId = () => 'proj-123';
      const { uploadDocument } = useProjectDocuments(projectId);

      const result = await uploadDocument({
        file: mockFile,
        title: 'Test Doc',
        documentType: 'quote',
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        file: mockFile,
        title: 'Test Doc',
        documentType: 'quote',
      });
      expect(result).toEqual(mockUploadedDoc);
    });

    it('should throw error when no project selected', async () => {
      vi.mocked(useMutation).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error('No project selected')),
      } as any);

      vi.mocked(useQuery).mockReturnValue({
        data: ref([]),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      } as any);

      const projectId = () => null;
      const { uploadDocument } = useProjectDocuments(projectId);

      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      await expect(
        uploadDocument({
          file: mockFile,
          title: 'Test Doc',
          documentType: 'quote',
        })
      ).rejects.toThrow('No project selected');
    });
  });
});
