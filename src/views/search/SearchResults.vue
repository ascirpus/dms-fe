<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearch } from '@/composables/useSearch';
import { useDocumentTypes } from '@/composables/useDocumentTypes';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Paginator from 'primevue/paginator';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';

const route = useRoute();
const router = useRouter();
const { documentTypes } = useDocumentTypes();

const queryParam = computed(() => (route.query.q as string) || '');
const projectIdParam = computed(() => (route.query.projectId as string) || undefined);

const projectIdRef = computed(() => projectIdParam.value);
const { query: searchQuery, results, loading, search } = useSearch(projectIdRef);

// Pagination
const first = ref(0);
const rows = ref(10);
const paginatedResults = computed(() =>
  results.value.slice(first.value, first.value + rows.value)
);

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}

function getDocumentTypeName(typeId: string): string | undefined {
  return documentTypes.value?.find(dt => dt.id === typeId)?.name;
}

function navigateToDocument(projectId: string, documentId: string) {
  router.push({
    name: 'project-document',
    params: { id: projectId, documentId },
  });
}

function clearProjectScope() {
  router.push({ name: 'search', query: { q: queryParam.value } });
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    const q = searchQuery.value.trim();
    if (!q) return;
    const query: Record<string, string> = { q };
    if (projectIdParam.value) {
      query.projectId = projectIdParam.value;
    }
    router.push({ name: 'search', query });
  }
}

function doSearch() {
  if (queryParam.value) {
    searchQuery.value = queryParam.value;
    first.value = 0;
    search(queryParam.value, projectIdParam.value);
  }
}

onMounted(doSearch);

watch([queryParam, projectIdParam], doSearch);
</script>

<template>
  <div class="search-results-view">
    <!-- Search header -->
    <div class="search-header">
      <IconField class="search-header-input">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          placeholder="Search documents..."
          class="w-full"
          @keydown="onSearchKeydown"
        />
      </IconField>

      <div v-if="projectIdParam" class="project-scope-badge">
        <Tag severity="info" rounded>
          <i class="pi pi-folder"></i>
          <span>Project scoped</span>
        </Tag>
        <Button
          label="Search all projects"
          text
          size="small"
          @click="clearProjectScope"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="search-loading">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Searching...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="queryParam && results.length === 0" class="search-empty">
      <i class="pi pi-search"></i>
      <h3>No results found</h3>
      <p>No documents matching "{{ queryParam }}" were found.</p>
    </div>

    <!-- No query state -->
    <div v-else-if="!queryParam" class="search-empty">
      <i class="pi pi-search"></i>
      <h3>Search documents</h3>
      <p>Enter a search term to find documents across your projects.</p>
    </div>

    <!-- Results list -->
    <div v-else class="search-results-list">
      <p class="results-count">{{ results.length }} result{{ results.length === 1 ? '' : 's' }} for "{{ queryParam }}"</p>

      <div
        v-for="result in paginatedResults"
        :key="result.documentId"
        class="search-result-card"
        @click="navigateToDocument(result.projectId, result.documentId)"
      >
        <div class="result-header">
          <i class="pi pi-file result-icon"></i>
          <span class="result-title">{{ result.title }}</span>
          <span class="result-project"><i class="pi pi-folder"></i>{{ result.projectName }}</span>
        </div>
        <p v-if="result.snippet" class="result-snippet" v-html="result.snippet"></p>
        <span v-if="getDocumentTypeName(result.documentTypeId)" class="result-doc-type">
          {{ getDocumentTypeName(result.documentTypeId) }}
        </span>
      </div>

      <Paginator
        v-if="results.length > rows"
        :first="first"
        :rows="rows"
        :totalRecords="results.length"
        :rowsPerPageOptions="[10, 20, 50]"
        @page="onPageChange"
        class="search-paginator"
      />
    </div>
  </div>
</template>

<style scoped>
.search-results-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.search-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-header-input {
  width: 100%;
}

.project-scope-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-scope-badge :deep(.p-tag) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--text-secondary);
}

.search-loading i {
  font-size: 24px;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.search-empty i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.search-empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.search-empty p {
  margin: 0;
  color: var(--text-secondary);
}

.results-count {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.search-results-list {
  display: flex;
  flex-direction: column;
}

.search-result-card {
  padding: 16px;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  background-color: var(--surface-card);
  transition: background-color 0.15s, border-color 0.15s;
}

.search-result-card:hover {
  background-color: var(--surface-ground);
  border-color: var(--primary-color);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-icon {
  font-size: 14px;
  color: var(--text-secondary);
}

.result-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--primary-color);
}

.result-snippet {
  margin: 8px 0 0 22px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.result-project {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.result-project i {
  font-size: 12px;
}

.result-doc-type {
  display: inline-block;
  margin-top: 6px;
  margin-left: 22px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--text-secondary);
  background-color: var(--surface-ground);
  border-radius: 12px;
}

.search-paginator {
  margin-top: 8px;
}

.search-paginator :deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 0;
  justify-content: center;
}

.result-snippet :deep(em) {
  font-style: normal;
  font-weight: 600;
  color: var(--text-color);
}
</style>
