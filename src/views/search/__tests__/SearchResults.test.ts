import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import SearchResults from '../SearchResults.vue';

const mockPush = vi.fn();
const mockRoute = ref({
  query: { q: '' },
  matched: [],
  params: {},
  path: '/search',
});

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute.value,
  useRouter: () => ({ push: mockPush }),
}));

const mockSearch = vi.fn();
const mockSearchQuery = ref('');
const mockResults = ref<any[]>([]);
const mockLoading = ref(false);

vi.mock('@/composables/useSearch', () => ({
  useSearch: () => ({
    query: mockSearchQuery,
    results: mockResults,
    loading: mockLoading,
    search: mockSearch,
    clear: vi.fn(),
  }),
}));

vi.mock('@/composables/useDocumentTypes', () => ({
  useDocumentTypes: () => ({
    documentTypes: ref([
      { id: 'dt-1', name: 'Contract' },
      { id: 'dt-2', name: 'Invoice' },
    ]),
  }),
}));

// Stub PrimeVue components
const stubs = {
  Button: { template: '<button @click="$emit(\'click\')"><slot />{{ label }}</button>', props: ['label', 'text', 'size', 'icon'] },
  Tag: { template: '<span class="tag"><slot />{{ $attrs.value }}</span>', props: ['value', 'severity', 'rounded'] },
  InputText: { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown="$emit(\'keydown\', $event)" />', props: ['modelValue', 'placeholder'], emits: ['update:modelValue', 'keydown'] },
  InputIcon: { template: '<span><slot /></span>' },
  IconField: { template: '<div><slot /></div>' },
};

describe('SearchResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchQuery.value = '';
    mockResults.value = [];
    mockLoading.value = false;
    mockRoute.value = { query: { q: '' }, matched: [], params: {}, path: '/search' };
  });

  it('should render search input', () => {
    const wrapper = mount(SearchResults, { global: { stubs } });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('should show empty prompt when no query', () => {
    const wrapper = mount(SearchResults, { global: { stubs } });
    expect(wrapper.text()).toContain('Search documents');
    expect(wrapper.text()).toContain('Enter a search term');
  });

  it('should show no results message when query has no matches', async () => {
    mockRoute.value = { query: { q: 'nonexistent' }, matched: [], params: {}, path: '/search' };
    mockResults.value = [];

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(wrapper.text()).toContain('No results found');
    expect(wrapper.text()).toContain('nonexistent');
  });

  it('should show loading state', async () => {
    mockRoute.value = { query: { q: 'test' }, matched: [], params: {}, path: '/search' };
    mockLoading.value = true;

    const wrapper = mount(SearchResults, { global: { stubs } });

    expect(wrapper.text()).toContain('Searching...');
  });

  it('should render search results', async () => {
    mockRoute.value = { query: { q: 'contract' }, matched: [], params: {}, path: '/search' };
    mockResults.value = [
      {
        documentId: 'doc-1',
        projectId: 'proj-1',
        title: 'Contract Agreement',
        documentTypeId: 'dt-1',
        snippet: 'This is a contract...',
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

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(wrapper.text()).toContain('Contract Agreement');
    expect(wrapper.text()).toContain('This is a contract...');
    expect(wrapper.text()).toContain('Contract Amendment');
    expect(wrapper.text()).toContain('2 results');
  });

  it('should display document type badges', async () => {
    mockRoute.value = { query: { q: 'contract' }, matched: [], params: {}, path: '/search' };
    mockResults.value = [
      {
        documentId: 'doc-1',
        projectId: 'proj-1',
        title: 'Contract Agreement',
        documentTypeId: 'dt-1',
        rank: 1,
      },
    ];

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(wrapper.text()).toContain('Contract');
  });

  it('should navigate to document on result click', async () => {
    mockRoute.value = { query: { q: 'contract' }, matched: [], params: {}, path: '/search' };
    mockResults.value = [
      {
        documentId: 'doc-1',
        projectId: 'proj-1',
        title: 'Contract Agreement',
        documentTypeId: 'dt-1',
        rank: 1,
      },
    ];

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    const resultCards = wrapper.findAll('[class*="cursor-pointer"]').filter(el => el.text().includes('Contract Agreement'));
    await resultCards[0].trigger('click');

    expect(mockPush).toHaveBeenCalledWith({
      name: 'project-document',
      params: { id: 'proj-1', documentId: 'doc-1' },
    });
  });

  it('should show project scope badge when projectId is in query', async () => {
    mockRoute.value = { query: { q: 'test', projectId: 'proj-1' }, matched: [], params: {}, path: '/search' };

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(wrapper.text()).toContain('Project scoped');
    expect(wrapper.text()).toContain('Search all projects');
  });

  it('should clear project scope when clicking "Search all projects"', async () => {
    mockRoute.value = { query: { q: 'test', projectId: 'proj-1' }, matched: [], params: {}, path: '/search' };

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    const clearBtn = wrapper.findAll('button').find(b => b.text().includes('Search all projects'));
    expect(clearBtn).toBeTruthy();
    await clearBtn!.trigger('click');

    expect(mockPush).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'test' },
    });
  });

  it('should call search on mount with query params', async () => {
    mockRoute.value = { query: { q: 'initial query' }, matched: [], params: {}, path: '/search' };

    mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(mockSearch).toHaveBeenCalledWith('initial query', undefined);
  });

  it('should call search with projectId when present', async () => {
    mockRoute.value = { query: { q: 'test', projectId: 'proj-1' }, matched: [], params: {}, path: '/search' };

    mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(mockSearch).toHaveBeenCalledWith('test', 'proj-1');
  });

  it('should show results count with correct pluralization', async () => {
    mockRoute.value = { query: { q: 'test' }, matched: [], params: {}, path: '/search' };
    mockResults.value = [
      { documentId: 'doc-1', projectId: 'proj-1', title: 'Single Result', documentTypeId: 'dt-1', rank: 1 },
    ];

    const wrapper = mount(SearchResults, { global: { stubs } });
    await flushPromises();

    expect(wrapper.text()).toContain('1 result for');
  });
});
