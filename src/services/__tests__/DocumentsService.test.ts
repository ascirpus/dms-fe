import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentsService } from '../DocumentsService';
import type { Document, DocumentStatus } from '@/types/Document';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    service = new DocumentsService(mockApiClient);
  });

  describe('fetchDocumentById', () => {
    it('should fetch and return a document', async () => {
      const mockDoc: Document = {
        id: 'doc-1',
        title: 'Test Document',
        documentType: { id: 'type-1', name: 'Invoice', requiresApproval: false, defaultApprovalThreshold: 0, requiresSignature: false, defaultPermissions: 1, meta: {} },
        status: 'Pending' as DocumentStatus,
        versions: [],
      };

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockDoc,
        },
      });

      const result = await service.fetchDocumentById('proj-1', 'doc-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-1/documents/doc-1');
      expect(result).toEqual(mockDoc);
    });
  });

  describe('approveDocument', () => {
    it('should call approve endpoint', async () => {
      mockApiClient.post.mockResolvedValue({});

      await service.approveDocument('proj-1', 'doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/approve',
        {},
      );
    });

    it('should throw error on failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Forbidden'));

      await expect(service.approveDocument('proj-1', 'doc-1')).rejects.toThrow('Forbidden');
    });
  });

  describe('uploadDocument', () => {
    it('should upload document with metadata as JSON blob', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const metadata = {
        title: 'Test Document',
        document_type_id: 'type-1',
      };

      const mockDoc = {
        id: 'doc-new',
        title: 'Test Document',
        status: 'PENDING',
        versions: [],
      };

      mockApiClient.post.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockDoc },
      });

      const result = await service.uploadDocument('proj-1', mockFile, metadata);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents',
        expect.any(FormData),
      );
      expect(result).toEqual(mockDoc);
    });

    it('should throw error on upload failure', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const metadata = { title: 'Test', document_type_id: 'type-1' };

      mockApiClient.post.mockRejectedValue(new Error('File too large'));

      await expect(
        service.uploadDocument('proj-1', mockFile, metadata),
      ).rejects.toThrow('File too large');
    });
  });

  describe('declineDocument', () => {
    it('should call decline endpoint with comment', async () => {
      mockApiClient.post.mockResolvedValue({});

      await service.declineDocument('proj-1', 'doc-1', 'Not acceptable');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/decline',
        { comment: 'Not acceptable' },
      );
    });

    it('should call decline endpoint without comment', async () => {
      mockApiClient.post.mockResolvedValue({});

      await service.declineDocument('proj-1', 'doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/decline',
        { comment: undefined },
      );
    });
  });

  describe('getApprovals', () => {
    it('should fetch and return approvals', async () => {
      const mockApprovals = [
        { id: 'a-1', user: { id: 'u-1', email: 'test@test.com' }, action: 'APPROVE', comment: null, createdAt: '2024-01-01' },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockApprovals },
      });

      const result = await service.getApprovals('proj-1', 'doc-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-1/documents/doc-1/approvals');
      expect(result).toEqual(mockApprovals);
    });
  });

  describe('signDocument', () => {
    it('should call sign endpoint', async () => {
      mockApiClient.post.mockResolvedValue({});

      await service.signDocument('proj-1', 'doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/sign',
        {},
      );
    });
  });

  describe('getSignatureStatus', () => {
    it('should fetch and return signature status', async () => {
      const mockStatus = {
        signatures: [],
        signedCount: 0,
      };

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockStatus },
      });

      const result = await service.getSignatureStatus('proj-1', 'doc-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/projects/proj-1/documents/doc-1/signatures');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('uploadVersion', () => {
    it('should upload to the same endpoint with document_id in metadata', async () => {
      const mockFile = new File(['content'], 'v2.pdf', { type: 'application/pdf' });
      const metadata = { title: 'Test Document', document_type_id: 'type-1' };

      const mockDoc = {
        id: 'doc-1',
        title: 'Test Document',
        status: 'PENDING',
        versions: [],
      };

      mockApiClient.post.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockDoc },
      });

      const result = await service.uploadVersion('proj-1', 'doc-1', mockFile, metadata);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents',
        expect.any(FormData),
      );

      const formData = mockApiClient.post.mock.calls[0][1] as FormData;
      expect(formData.get('file')).toBeTruthy();
      expect(formData.get('document')).toBeTruthy();

      expect(result).toEqual(mockDoc);
    });
  });

});
