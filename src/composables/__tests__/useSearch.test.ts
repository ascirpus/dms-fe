import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSearch } from '../useSearch';
import { useAuth } from '../useAuth';
import { ref, nextTick } from 'vue';

vi.mock('../useAuth');

const mockSearch = vi.fn();

vi.mock('@/services/SearchService', () => ({
  SearchService: class {
    search = mockSearch;
    constructor() {}
  },
}));

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.mocked(useAuth).mockReturnValue({
      apiClient: {},
    } as any);

    mockSearch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty state', () => {
    const { query, results, loading } = useSearch();

    expect(query.value).toBe('');
    expect(results.value).toEqual([]);
    expect(loading.value).toBe(false);
  });

  it('should search when query changes and length >= 2', async () => {
    const mockResults = [
      { documentId: 'doc-1', projectId: 'proj-1', title: 'Test', documentTypeId: 'dt-1', rank: 1 },
    ];
    mockSearch.mockResolvedValue(mockResults);

    const { query, results } = useSearch();

    query.value = 'te';
    await nextTick();
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(mockSearch).toHaveBeenCalledWith('te', undefined);
    expect(results.value).toEqual(mockResults);
  });

  it('should not search when query is shorter than 2 characters', async () => {
    const { query, results } = useSearch();

    query.value = 'a';
    await nextTick();
    vi.advanceTimersByTime(300);

    expect(mockSearch).not.toHaveBeenCalled();
    expect(results.value).toEqual([]);
  });

  it('should debounce search by 300ms', async () => {
    mockSearch.mockResolvedValue([]);

    const { query } = useSearch();

    query.value = 'te';
    await nextTick();

    vi.advanceTimersByTime(100);
    expect(mockSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    await vi.runAllTimersAsync();
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous debounce when query changes rapidly', async () => {
    mockSearch.mockResolvedValue([]);

    const { query } = useSearch();

    query.value = 'te';
    await nextTick();
    vi.advanceTimersByTime(200);

    query.value = 'tes';
    await nextTick();
    vi.advanceTimersByTime(200);

    query.value = 'test';
    await nextTick();
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch).toHaveBeenCalledWith('test', undefined);
  });

  it('should pass projectId to search when provided', async () => {
    mockSearch.mockResolvedValue([]);
    const projectId = ref<string | undefined>('proj-123');

    const { query } = useSearch(projectId);

    query.value = 'test';
    await nextTick();
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(mockSearch).toHaveBeenCalledWith('test', 'proj-123');
  });

  it('should pass undefined projectId when not provided', async () => {
    mockSearch.mockResolvedValue([]);

    const { query } = useSearch();

    query.value = 'test';
    await nextTick();
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(mockSearch).toHaveBeenCalledWith('test', undefined);
  });

  it('should set loading state during search', async () => {
    let resolveSearch: (value: any) => void;
    mockSearch.mockReturnValue(new Promise(r => { resolveSearch = r; }));

    const { query, loading, search } = useSearch();

    const searchPromise = search('test query');
    expect(loading.value).toBe(true);

    resolveSearch!([]);
    await searchPromise;
    expect(loading.value).toBe(false);
  });

  it('should handle search errors gracefully', async () => {
    mockSearch.mockRejectedValue(new Error('Network error'));

    const { search, results, loading } = useSearch();

    await search('test');

    expect(results.value).toEqual([]);
    expect(loading.value).toBe(false);
  });

  it('should clear query and results', () => {
    const { query, results, clear } = useSearch();

    query.value = 'test';
    results.value = [
      { documentId: 'doc-1', projectId: 'proj-1', title: 'Test', documentTypeId: 'dt-1', rank: 1 },
    ] as any;

    clear();

    expect(query.value).toBe('');
    expect(results.value).toEqual([]);
  });

  it('should clear results when query becomes shorter than 2 chars', async () => {
    const mockResults = [
      { documentId: 'doc-1', projectId: 'proj-1', title: 'Test', documentTypeId: 'dt-1', rank: 1 },
    ];
    mockSearch.mockResolvedValue(mockResults);

    const { query, results } = useSearch();

    query.value = 'te';
    await nextTick();
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    expect(results.value).toEqual(mockResults);

    query.value = 't';
    await nextTick();
    expect(results.value).toEqual([]);
  });

  it('should not search for whitespace-only query', async () => {
    const { search, results } = useSearch();

    await search('   ');

    expect(mockSearch).not.toHaveBeenCalled();
    expect(results.value).toEqual([]);
  });
});
