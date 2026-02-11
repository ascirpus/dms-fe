<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSearch } from '@/composables/useSearch';
import { useDocumentTypes } from '@/composables/useDocumentTypes';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Paginator from 'primevue/paginator';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import { sanitizeIcon, buildDocumentTypeColorMap } from '@/utils/documentTypeIcons';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { documentTypes } = useDocumentTypes();
const docTypeColorMap = computed(() =>
  buildDocumentTypeColorMap((documentTypes.value ?? []).map(dt => dt.id))
);

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

function getDocumentType(typeId: string) {
  return documentTypes.value?.find(dt => dt.id === typeId);
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
  <div class="flex flex-col gap-6 w-full max-w-[800px] mx-auto py-6 px-4">
    <!-- Search header -->
    <div class="flex flex-col gap-3">
      <IconField class="w-full">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          :placeholder="$t('searchResults.searchDocuments')"
          class="w-full"
          @keydown="onSearchKeydown"
        />
      </IconField>

      <div v-if="projectIdParam" class="project-scope-badge flex items-center gap-3">
        <Tag severity="info" rounded>
          <i class="pi pi-folder"></i>
          <span>{{ $t('searchResults.projectScoped') }}</span>
        </Tag>
        <Button
          :label="$t('searchResults.searchAllProjects')"
          text
          size="small"
          @click="clearProjectScope"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center gap-3 p-12 text-[var(--text-secondary)]">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
      <span>{{ $t('searchResults.searching') }}</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="queryParam && results.length === 0" class="flex flex-col items-center justify-center p-12 text-center">
      <i class="pi pi-search text-[48px] mb-4 text-[var(--text-secondary)]"></i>
      <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">{{ $t('searchResults.noResults') }}</h3>
      <p class="m-0 text-[var(--text-secondary)]">{{ $t('searchResults.noDocsMatching', { query: queryParam }) }}</p>
    </div>

    <!-- No query state -->
    <div v-else-if="!queryParam" class="flex flex-col items-center justify-center p-12 text-center">
      <i class="pi pi-search text-[48px] mb-4 text-[var(--text-secondary)]"></i>
      <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">{{ $t('searchResults.searchDocsTitle') }}</h3>
      <p class="m-0 text-[var(--text-secondary)]">{{ $t('searchResults.enterSearchTerm') }}</p>
    </div>

    <!-- Results list -->
    <div v-else class="flex flex-col">
      <p class="text-sm text-[var(--text-secondary)] m-0 mb-4">{{ $t('searchResults.resultCount', { count: results.length, query: queryParam }, results.length) }}</p>

      <div
        v-for="result in paginatedResults"
        :key="result.documentId"
        class="p-4 border border-[var(--surface-border)] rounded-lg mb-3 cursor-pointer bg-[var(--surface-card)] transition-colors duration-150 hover:bg-[var(--surface-ground)] hover:border-[var(--primary-color)]"
        @click="navigateToDocument(result.projectId, result.documentId)"
      >
        <div class="flex items-center gap-2">
          <i class="pi pi-file text-sm text-[var(--text-secondary)]"></i>
          <span class="text-[15px] font-medium text-[var(--primary-color)]">{{ result.title }}</span>
          <span class="flex items-center gap-1.5 ml-auto text-[13px] font-medium text-[var(--text-secondary)]"><i class="pi pi-folder text-xs"></i>{{ result.projectName }}</span>
        </div>
        <p v-if="result.snippet" class="result-snippet mt-2 ml-[22px] text-[13px] text-[var(--text-secondary)] leading-normal" v-html="result.snippet"></p>
        <span v-if="getDocumentType(result.documentTypeId)" class="inline-flex items-center gap-1 mt-1.5 ml-[22px] py-0.5 px-2 text-[11px] text-[var(--text-secondary)] bg-[var(--surface-ground)] rounded-xl">
          <i :class="'pi ' + sanitizeIcon(getDocumentType(result.documentTypeId)?.meta?.icon)" class="text-[10px]" :style="{ color: docTypeColorMap.get(result.documentTypeId) }" />
          {{ getDocumentType(result.documentTypeId)?.name }}
        </span>
      </div>

      <Paginator
        v-if="results.length > rows"
        :first="first"
        :rows="rows"
        :totalRecords="results.length"
        :rowsPerPageOptions="[10, 20, 50]"
        @page="onPageChange"
        class="search-paginator mt-2"
      />
    </div>
  </div>
</template>

<style scoped>
.project-scope-badge :deep(.p-tag) {
  display: flex;
  align-items: center;
  gap: 6px;
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
