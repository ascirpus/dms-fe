import { ref, watch, type Ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { SearchService } from '@/services/SearchService';
import type { SearchResultDTO } from '@/types/Search';

export function useSearch(projectId?: Ref<string | undefined>) {
  const { apiClient } = useAuth();
  const api = new SearchService(apiClient);

  const query = ref('');
  const results = ref<SearchResultDTO[]>([]);
  const loading = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function search(q: string, pid?: string) {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      results.value = [];
      return;
    }

    loading.value = true;
    try {
      results.value = await api.search(trimmed, pid);
    } catch (error) {
      console.error('Search failed:', error);
      results.value = [];
    } finally {
      loading.value = false;
    }
  }

  watch(query, (newQuery) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (newQuery.trim().length < 2) {
      results.value = [];
      return;
    }

    debounceTimer = setTimeout(() => {
      search(newQuery, projectId?.value);
    }, 300);
  });

  function clear() {
    query.value = '';
    results.value = [];
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  }

  return {
    query,
    results,
    loading,
    search,
    clear,
  };
}
