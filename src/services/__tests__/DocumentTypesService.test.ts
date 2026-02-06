import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentTypesService } from '../DocumentTypesService';
import type { DocumentTypeDTO } from '@/types/DocumentType';

describe('DocumentTypesService', () => {
  let service: DocumentTypesService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    service = new DocumentTypesService(mockApiClient);
  });

  describe('fetchAll', () => {
    it('should fetch and return all document types', async () => {
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

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockTypes },
      });

      const result = await service.fetchAll();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/document-types');
      expect(result).toEqual(mockTypes);
    });

    it('should handle empty list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: [] },
      });

      const result = await service.fetchAll();
      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchAll()).rejects.toThrow('Network error');
    });
  });

  describe('fetchById', () => {
    it('should fetch a single document type', async () => {
      const mockType: DocumentTypeDTO = {
        id: 'dt-1',
        name: 'Invoice',
        requiresApproval: true,
        defaultApprovalThreshold: 2,
        requiresSignature: false,
        defaultPermissions: 1,
      };

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockType },
      });

      const result = await service.fetchById('dt-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/document-types/dt-1');
      expect(result).toEqual(mockType);
    });

    it('should throw error when not found', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Not found'));

      await expect(service.fetchById('invalid')).rejects.toThrow('Not found');
    });
  });

  describe('create', () => {
    it('should create and return a new document type', async () => {
      const createData = {
        name: 'Purchase Order',
        requiresApproval: true,
        defaultApprovalThreshold: 1,
      };

      const mockCreated: DocumentTypeDTO = {
        id: 'dt-new',
        name: 'Purchase Order',
        requiresApproval: true,
        defaultApprovalThreshold: 1,
        requiresSignature: false,
        defaultPermissions: 1,
      };

      mockApiClient.post.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockCreated },
      });

      const result = await service.create(createData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/document-types', createData);
      expect(result).toEqual(mockCreated);
    });

    it('should handle validation errors', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Name is required'));

      await expect(service.create({ name: '' })).rejects.toThrow('Name is required');
    });
  });

  describe('update', () => {
    it('should update and return the document type', async () => {
      const updateData = { name: 'Updated Invoice' };

      const mockUpdated: DocumentTypeDTO = {
        id: 'dt-1',
        name: 'Updated Invoice',
        requiresApproval: true,
        defaultApprovalThreshold: 2,
        requiresSignature: false,
        defaultPermissions: 1,
      };

      mockApiClient.put.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockUpdated },
      });

      const result = await service.update('dt-1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/document-types/dt-1', updateData);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw error on failure', async () => {
      mockApiClient.put.mockRejectedValue(new Error('Update failed'));

      await expect(service.update('dt-1', { name: 'test' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete a document type', async () => {
      mockApiClient.delete.mockResolvedValue({});

      await service.delete('dt-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/document-types/dt-1');
    });

    it('should throw error when in use', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Document type is in use'));

      await expect(service.delete('dt-1')).rejects.toThrow('Document type is in use');
    });

    it('should throw error when not found', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Not found'));

      await expect(service.delete('invalid')).rejects.toThrow('Not found');
    });
  });
});
