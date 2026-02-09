import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import ProjectList from '../ProjectList.vue';
import { useProjects } from '@/composables/useProjects';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { ProjectListItem } from '@/services/ProjectsService';

vi.mock('@/composables/useProjects');
vi.mock('vue-router');
vi.mock('primevue/usetoast');
vi.mock('primevue/useconfirm');

// Stub PrimeVue components
const globalStubs = {
  DataTable: {
    template: '<div class="datatable-stub"><slot name="empty" /><slot name="loading" /></div>',
    props: ['value', 'loading', 'filters'],
  },
  Button: {
    template: '<button @click="$emit(\'click\')"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon'],
  },
  NewProjectDialog: {
    template: '<div class="new-project-dialog-stub"></div>',
    props: ['visible'],
  },
  Column: { template: '<div />', props: ['field', 'header'] },
  InputText: { template: '<input />', props: ['modelValue'] },
  InputIcon: { template: '<span />' },
  IconField: { template: '<div><slot /></div>' },
  Paginator: { template: '<div />', props: ['first', 'rows', 'totalRecords'] },
};

describe('ProjectList.vue', () => {
  let mockRouter: any;
  let mockToast: any;
  let mockConfirm: any;
  let mockProjects: ProjectListItem[];

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
    };

    mockToast = {
      add: vi.fn(),
    };

    mockConfirm = {
      require: vi.fn(),
    };

    mockProjects = [
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
      {
        project: {
          id: 'proj-2',
          name: 'Project 2',
          description: 'Description 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        document_count: 3,
      },
    ];

    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useConfirm).mockReturnValue(mockConfirm);
  });

  describe('Initial Render', () => {
    it('should render projects list', () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn((p) => `project-${p.id}`),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.projects).toHaveLength(2);
    });

    it('should show loading state', () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(null),
        loading: ref(true),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.loading).toBe(true);
    });

    it('should show error state', () => {
      const mockError = new Error('Failed to fetch');

      vi.mocked(useProjects).mockReturnValue({
        projects: ref(null),
        loading: ref(false),
        error: ref(mockError),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.error).toBe(mockError);
      expect(wrapper.text()).toContain('Error loading projects');
    });
  });

  describe('Project Creation', () => {
    it('should open dialog when New Project button clicked', async () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.showNewProjectDialog).toBe(false);

      const newProjectButton = wrapper.findAll('button').find(b =>
        b.text().includes('New Project')
      );
      await newProjectButton?.trigger('click');

      expect(wrapper.vm.showNewProjectDialog).toBe(true);
    });

    it('should show toast on project created', async () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      const newProject = {
        id: 'proj-3',
        name: 'New Project',
        description: 'New Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      wrapper.vm.onProjectCreated(newProject);

      expect(wrapper.vm.showNewProjectDialog).toBe(false);
      expect(mockToast.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          summary: 'Project Created',
        })
      );
    });
  });

  describe('Project Navigation', () => {
    it('should navigate to project details when row clicked', () => {
      const mockGetProjectUrl = vi.fn((p) => `project-${p.id}`);

      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: mockGetProjectUrl,
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      wrapper.vm.navigateToProject(mockProjects[0]);

      expect(mockGetProjectUrl).toHaveBeenCalledWith(mockProjects[0].project);
      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'project-details',
        params: { id: 'project-proj-1' },
      });
    });

    it('should navigate to project settings when edit clicked', () => {
      const mockGetProjectUrl = vi.fn((p) => `project-${p.id}`);

      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: mockGetProjectUrl,
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      wrapper.vm.editRow(mockProjects[0]);

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'project-settings',
        params: { id: 'project-proj-1' },
      });
    });
  });

  describe('Project Deletion', () => {
    it('should show confirm dialog when delete clicked', () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      wrapper.vm.confirmDeleteRow(mockProjects[0]);

      expect(mockConfirm.require).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Project 1'),
          header: 'Delete Project',
        })
      );
    });

    it('should delete project and show toast on success', async () => {
      const mockDeleteProject = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: mockDeleteProject,
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      await wrapper.vm.handleDeleteProject('proj-1');

      expect(mockDeleteProject).toHaveBeenCalledWith('proj-1');
      expect(mockToast.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'success',
          summary: 'Project Deleted',
        })
      );
    });

    it('should show error toast on delete failure', async () => {
      const mockDeleteProject = vi.fn().mockRejectedValue(new Error('Delete failed'));

      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: mockDeleteProject,
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      await wrapper.vm.handleDeleteProject('proj-1');

      expect(mockToast.add).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
          summary: 'Error',
        })
      );
    });
  });

  describe('Filters', () => {
    it('should have filters initialized', () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.filterText).toBe('');
    });
  });

  describe('Filtering', () => {
    it('should filter projects by name', async () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      wrapper.vm.filterText = 'Project 1';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.filteredProjects).toHaveLength(1);
      expect(wrapper.vm.filteredProjects[0].project.name).toBe('Project 1');
    });

    it('should return all projects when filter is empty', () => {
      vi.mocked(useProjects).mockReturnValue({
        projects: ref(mockProjects),
        loading: ref(false),
        error: ref(null),
        refetchProjects: vi.fn(),
        getProjectUrl: vi.fn(),
        createProject: vi.fn(),
        deleteProject: vi.fn(),
        fetchProjectById: vi.fn(),
        resolveProject: vi.fn(),
        resolveProjectId: vi.fn(),
        useResolvedProjectId: vi.fn(),
      } as any);

      const wrapper = mount(ProjectList, {
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.filteredProjects).toHaveLength(2);
    });
  });
});
