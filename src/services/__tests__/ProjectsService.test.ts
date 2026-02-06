import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectsService, type ProjectListItem } from '../ProjectsService';
import type { Project } from '@/types/Project';
import type { Document } from '@/types/Document';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    service = new ProjectsService(mockApiClient);
  });

  describe('fetchProjects', () => {
    it('should fetch and return project list', async () => {
      const mockProjects: ProjectListItem[] = [
        {
          project: {
            id: 'proj-1',
            name: 'Test Project 1',
            description: 'Description 1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 5,
        },
        {
          project: {
            id: 'proj-2',
            name: 'Test Project 2',
            description: 'Description 2',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          document_count: 3,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockProjects,
        },
      });

      const result = await service.fetchProjects();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should handle empty project list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      const result = await service.fetchProjects();

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchProjects()).rejects.toThrow('Network error');
    });
  });

  describe('fetchProjectById', () => {
    it('should fetch and return single project', async () => {
      const mockProject: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockProject,
        },
      });

      const result = await service.fetchProjectById('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-123');
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Project not found'));

      await expect(service.fetchProjectById('invalid-id')).rejects.toThrow('Project not found');
    });
  });

  describe('fetchProjectDocuments', () => {
    it('should fetch and return project documents', async () => {
      const mockApiDocs = [
        {
          id: 'doc-1',
          title: 'Document 1',
          content: 'Content 1',
          status: 'PENDING',
        },
        {
          id: 'doc-2',
          title: 'Document 2',
          content: 'Content 2',
          status: 'APPROVED',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockApiDocs,
        },
      });

      const result = await service.fetchProjectDocuments('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-123/documents');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('doc-1');
      expect(result[0].title).toBe('Document 1');
      expect(result[1].id).toBe('doc-2');
    });

    it('should handle empty document list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      const result = await service.fetchProjectDocuments('proj-123');

      expect(result).toEqual([]);
    });
  });

  describe('createProject', () => {
    it('should create and return new project', async () => {
      const projectData = {
        name: 'New Project',
        description: 'New Description',
      };

      const mockCreatedProject: Project = {
        id: 'proj-new',
        name: 'New Project',
        description: 'New Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiClient.post.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockCreatedProject,
        },
      });

      const result = await service.createProject(projectData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/projects', projectData);
      expect(result).toEqual(mockCreatedProject);
      expect(result.name).toBe('New Project');
    });

    it('should handle validation errors', async () => {
      const projectData = {
        name: '',
        description: 'Description',
      };

      mockApiClient.post.mockRejectedValue(new Error('Name is required'));

      await expect(service.createProject(projectData)).rejects.toThrow('Name is required');
    });

    it('should create project with empty description', async () => {
      const projectData = {
        name: 'Project Name',
        description: '',
      };

      const mockCreatedProject: Project = {
        id: 'proj-new',
        name: 'Project Name',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiClient.post.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockCreatedProject,
        },
      });

      const result = await service.createProject(projectData);

      expect(result.description).toBe('');
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await service.deleteProject('proj-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/projects/proj-123');
    });

    it('should handle delete errors', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Project has documents'));

      await expect(service.deleteProject('proj-123')).rejects.toThrow('Project has documents');
    });

    it('should handle not found error', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Project not found'));

      await expect(service.deleteProject('invalid-id')).rejects.toThrow('Project not found');
    });
  });

  describe('fetchProjectMembers', () => {
    it('should fetch and return project members', async () => {
      const mockMembers = [
        {
          userId: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'MEMBER' as const,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'ADMIN' as const,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockMembers,
        },
      });

      const result = await service.fetchProjectMembers('proj-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-123/members');
      expect(result).toEqual(mockMembers);
      expect(result).toHaveLength(2);
    });

    it('should handle empty members list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      const result = await service.fetchProjectMembers('proj-123');

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Forbidden'));

      await expect(service.fetchProjectMembers('proj-123')).rejects.toThrow('Forbidden');
    });
  });

});
