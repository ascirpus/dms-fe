import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApprovals } from '../useApprovals';
import { useAuth } from '../useAuth';
import { useQueryClient } from 'vue-query';
import type { DocumentApproval, SignatureStatus } from '@/types/Document';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
  useQueryClient: vi.fn(),
  useMutation: vi.fn((config: any) => ({
    mutateAsync: vi.fn(async (params: any) => {
      const result = await config.mutationFn(params);
      if (config.onSuccess) {
        config.onSuccess(result, params);
      }
      return result;
    }),
  })),
}));

describe('useApprovals', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      invalidateQueries: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
  });

  describe('fetchApprovals', () => {
    it('should fetch and store approvals', async () => {
      const mockApprovals: DocumentApproval[] = [
        {
          id: 'a-1',
          user: { id: 'u-1', email: 'user@test.com', firstName: 'John', lastName: 'Doe' },
          action: 'APPROVE',
          comment: null,
          createdAt: '2024-01-15T10:30:00',
        },
      ];

      mockQueryClient.fetchQuery.mockResolvedValue(mockApprovals);

      const { fetchApprovals, approvals } = useApprovals();
      const result = await fetchApprovals('proj-1', 'doc-1');

      expect(result).toEqual(mockApprovals);
      expect(approvals.value).toEqual(mockApprovals);
      expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith({
        queryKey: ['approvals-proj-1-doc-1'],
        queryFn: expect.any(Function),
      });
    });
  });

  describe('fetchSignatureStatus', () => {
    it('should fetch and store signature status', async () => {
      const mockStatus: SignatureStatus = {
        signatures: [
          {
            user: { id: 'u-1', email: 'user@test.com' },
            signedAt: '2024-01-15T10:00:00',
            contentHash: 'abc123',
          },
        ],
        signedCount: 1,
      };

      mockQueryClient.fetchQuery.mockResolvedValue(mockStatus);

      const { fetchSignatureStatus, signatureStatus } = useApprovals();
      const result = await fetchSignatureStatus('proj-1', 'doc-1');

      expect(result).toEqual(mockStatus);
      expect(signatureStatus.value).toEqual(mockStatus);
    });
  });

  describe('approveDocument', () => {
    it('should call approve and invalidate queries', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { approveDocument } = useApprovals();
      await approveDocument('proj-1', 'doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/approve',
        {},
      );
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['approvals-proj-1-doc-1']);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['document-proj-1-doc-1']);
    });
  });

  describe('declineDocument', () => {
    it('should call decline with comment and invalidate queries', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { declineDocument } = useApprovals();
      await declineDocument('proj-1', 'doc-1', 'Not ready');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/decline',
        { comment: 'Not ready' },
      );
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['approvals-proj-1-doc-1']);
    });

    it('should call decline without comment', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { declineDocument } = useApprovals();
      await declineDocument('proj-1', 'doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/decline',
        { comment: undefined },
      );
    });
  });

  describe('signDocument', () => {
    it('should call sign and invalidate queries', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { signDocument } = useApprovals();
      await signDocument('proj-1', 'doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/projects/proj-1/documents/doc-1/sign',
        {},
      );
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['signatures-proj-1-doc-1']);
    });
  });
});
