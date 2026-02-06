import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchService } from '../SearchService';
import type { SearchResultDTO } from '@/types/Search';

describe('SearchService', () => {
  let service: SearchService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
    };

    service = new SearchService(mockApiClient);
  });

  describe('search', () => {
    it('should search with query parameter', async () => {
      const mockResults: SearchResultDTO[] = [
        {
          documentId: 'doc-1',
          projectId: 'proj-1',
          title: 'Contract Agreement',
          documentTypeId: 'dt-1',
          snippet: 'This contract agreement...',
          rank: 1,
        },
        {
          documentId: 'doc-2',
          projectId: 'proj-2',
          title: 'Contract Amendment',
          documentTypeId: 'dt-2',
          rank: 2,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockResults,
        },
      });

      const result = await service.search('contract');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/search', {
        params: { q: 'contract' },
      });
      expect(result).toEqual(mockResults);
      expect(result).toHaveLength(2);
    });

    it('should search with query and projectId', async () => {
      const mockResults: SearchResultDTO[] = [
        {
          documentId: 'doc-1',
          projectId: 'proj-1',
          title: 'Contract Agreement',
          documentTypeId: 'dt-1',
          rank: 1,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockResults,
        },
      });

      const result = await service.search('contract', 'proj-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/search', {
        params: { q: 'contract', projectId: 'proj-1' },
      });
      expect(result).toEqual(mockResults);
    });

    it('should not include projectId param when undefined', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      await service.search('test', undefined);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/search', {
        params: { q: 'test' },
      });
    });

    it('should return empty array when no results', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      const result = await service.search('nonexistent');

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.search('test')).rejects.toThrow('Network error');
    });
  });
});
