import { computed, type Ref } from 'vue';
import { useQuery, useQueryClient, useMutation } from 'vue-query';
import { useAuth } from '@/composables/useAuth';
import { ProjectsService, type ProjectListItem } from '@/services/ProjectsService';
import type { Project } from '@/types/Project';
import type { Document } from '@/types/Document';
import { extractShortId, toUrlId } from '@/utils/slugify';

export function useProjects() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const api = new ProjectsService(apiClient);

  // Fetch all projects
  const {
    data: projects,
    isLoading: loading,
    error,
    refetch: refetchProjects,
  } = useQuery<ProjectListItem[]>({
    queryKey: ['projects'],
    queryFn: () => api.fetchProjects(),
  });

  // Fetch single project by ID (uses cache or fetches)
  async function fetchProjectById(projectId: string): Promise<Project> {
    return queryClient.fetchQuery({
      queryKey: ['projects', projectId],
      queryFn: () => api.fetchProjectById(projectId),
    });
  }

  // Resolve a URL slug to a project from cache
  function resolveProject(urlSlug: string): ProjectListItem | null {
    if (!projects.value) return null;
    const shortId = extractShortId(urlSlug);
    return projects.value.find(item => item.project.id.startsWith(shortId)) ?? null;
  }

  // Resolve a URL slug to full project ID
  function resolveProjectId(urlSlug: string): string | null {
    return resolveProject(urlSlug)?.project.id ?? null;
  }

  // Create a reactive resolved project ID from a slug
  // This re-evaluates when projects data loads
  function useResolvedProjectId(slugRef: Ref<string> | (() => string)) {
    const slug = typeof slugRef === 'function' ? computed(slugRef) : slugRef;
    return computed(() => {
      if (!projects.value) return slug.value; // Fallback to slug while loading
      const shortId = extractShortId(slug.value);
      const match = projects.value.find(item => item.project.id.startsWith(shortId));
      return match?.project.id ?? slug.value;
    });
  }

  // Generate URL slug for a project
  function getProjectUrl(project: Project): string {
    return toUrlId(project.name, project.id);
  }

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => api.createProject(data),
    onSuccess: (newProject) => {
      queryClient.setQueryData<ProjectListItem[]>(['projects'], (old) => {
        if (!old) return [{ project: newProject, document_count: 0 }];
        return [...old, { project: newProject, document_count: 0 }];
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => api.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.setQueryData<ProjectListItem[]>(['projects'], (old) => {
        if (!old) return [];
        return old.filter(item => item.project.id !== projectId);
      });
    },
  });

  return {
    projects,
    loading,
    error,
    refetchProjects,
    fetchProjectById,
    resolveProject,
    resolveProjectId,
    useResolvedProjectId,
    getProjectUrl,
    createProject: createProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
  };
}

export function useProjectDocuments(projectId: () => string | null) {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const api = new ProjectsService(apiClient);

  const currentProjectId = computed(() => projectId());

  // Fetch documents for a project
  const {
    data: documents,
    isLoading: loading,
    error,
    refetch: refetchDocuments,
  } = useQuery<Document[]>({
    queryKey: computed(() => ['projects', currentProjectId.value, 'documents']),
    queryFn: () => {
      if (!currentProjectId.value) return Promise.resolve([]);
      return api.fetchProjectDocuments(currentProjectId.value);
    },
    enabled: computed(() => !!currentProjectId.value),
  });

  // Resolve a URL slug to a document
  function resolveDocument(urlSlug: string): Document | null {
    if (!documents.value) return null;
    const shortId = extractShortId(urlSlug);
    return documents.value.find(doc => doc.id.startsWith(shortId)) ?? null;
  }

  // Resolve a URL slug to full document ID
  function resolveDocumentId(urlSlug: string): string | null {
    return resolveDocument(urlSlug)?.id ?? null;
  }

  // Create a reactive resolved document ID from a slug
  function useResolvedDocumentId(slugRef: Ref<string> | (() => string)) {
    const slug = typeof slugRef === 'function' ? computed(slugRef) : slugRef;
    return computed(() => {
      if (!documents.value) return slug.value;
      const shortId = extractShortId(slug.value);
      const match = documents.value.find(doc => doc.id.startsWith(shortId));
      return match?.id ?? slug.value;
    });
  }

  // Generate URL slug for a document
  function getDocumentUrl(doc: Document): string {
    return toUrlId(doc.title, doc.id);
  }

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: (data: { file: File; title: string; documentType: string }) => {
      if (!currentProjectId.value) throw new Error('No project selected');
      return api.uploadDocument(currentProjectId.value, data.file, {
        title: data.title,
        document_type: data.documentType,
      });
    },
    onSuccess: (newDoc) => {
      queryClient.setQueryData<Document[]>(
        ['projects', currentProjectId.value, 'documents'],
        (old) => {
          if (!old) return [newDoc];
          return [newDoc, ...old];
        }
      );
    },
  });

  return {
    documents,
    loading,
    error,
    refetchDocuments,
    resolveDocument,
    resolveDocumentId,
    useResolvedDocumentId,
    getDocumentUrl,
    uploadDocument: uploadDocumentMutation.mutateAsync,
  };
}
