<script setup lang="ts">
import { onMounted, provide, ref, watch, computed, nextTick, type ComponentPublicInstance } from 'vue';
import Markers from '@/components/pdf-viewer/Markers.vue';
import { createLoadingTask } from 'vue3-pdfjs';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import Controls from '@/components/pdf-viewer/Controls.vue';
import { useMainStore } from '@/stores/mainStore';
import type { User } from '@/types';
import type { TenantUser } from '@/services/UsersService';

interface Props {
  pdfUrl: string;
  projectId: string;
  documentId: string;
  fileId: string;
  fileVersion: number;
  versioningEnabled?: boolean;
  projectMembers?: TenantUser[];
  highlightedCommentId?: string | null;
  markersExpanded?: boolean;
  showAllComments?: boolean;
  showMyComments?: boolean;
  currentUser?: User;
}

const props = withDefaults(defineProps<Props>(), {
  versioningEnabled: false,
  highlightedCommentId: null,
  markersExpanded: true,
  showAllComments: false,
  showMyComments: false,
  projectMembers: () => [],
});

const emit = defineEmits<{
  'show-version-history': [];
  'show-document-info': [];
  'confirm-version': [];
  'download': [];
  'print': [];
  'share': [];
  'show-all-comments': [];
  'show-my-comments': [];
  'expand-all-comments': [];
  'collapse-all-comments': [];
  'jump-to-page': [page: number];
  'reply-to-comment': [comment: any];
  'share-comment': [comment: any];
}>();

const appState = useMainStore();
const currentPage = ref(1);
const pdfLoaded = ref(false);
const pageCount = ref(0);
const pdfComponent = ref<ComponentPublicInstance | null>(null);
const markerEnabled = ref(appState.documentMarker);

provide('pdfComponentRef', pdfComponent);

const onPageUpdate = (page: number) => {
  currentPage.value = page;
};

const onToggleMarker = () => {
  const newState = !markerEnabled.value;
  markerEnabled.value = newState;
  appState.toggleDocumentMarker(newState);
  if (pdfComponent.value?.$el) {
    pdfComponent.value.$el.classList.toggle('marker-active', newState);
  }
};

function loadPdf(url: string) {
  if (!url) return;
  pdfLoaded.value = false;
  pageCount.value = 0;
  currentPage.value = 1;

  const loadingTask = createLoadingTask(url);
  loadingTask.promise.then((pdf: PDFDocumentProxy) => {
    pageCount.value = pdf.numPages;
    pdfLoaded.value = true;
  });
}

onMounted(() => {
  loadPdf(props.pdfUrl);
});

// Reload PDF when URL changes (version switching)
watch(() => props.pdfUrl, (newUrl) => {
  loadPdf(newUrl);
});

appState.$subscribe((_mutations, state) => {
  markerEnabled.value = state.documentMarker;
  if (pdfComponent.value?.$el) {
    pdfComponent.value.$el.classList.toggle('marker-active', markerEnabled.value);
  }
});

const scrollAreaRef = ref<HTMLElement | null>(null);

function jumpToPage(page: number, scrollToY?: number) {
  if (page >= 1 && page <= pageCount.value) {
    currentPage.value = page;
    if (scrollToY != null) {
      nextTick(() => {
        if (!scrollAreaRef.value) return;
        const areaHeight = scrollAreaRef.value.clientHeight;
        const targetScroll = Math.max(0, scrollToY - areaHeight / 3);
        scrollAreaRef.value.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    }
  }
}

defineExpose({ jumpToPage });
</script>

<template>
  <div class="relative w-full h-full flex flex-col">
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top controls: page navigation -->
      <Controls
        variant="top"
        :current-page="currentPage"
        :page-count="pageCount"
        @update:page="onPageUpdate"
      />

      <div ref="scrollAreaRef" class="flex-1 relative overflow-auto">
        <VuePdf
          ref="pdfComponent"
          :src="pdfUrl"
          :page="currentPage"
          :key="`${pdfUrl}-${currentPage}`"
          class="pdf-file"
        />

        <Markers
          :key="`markers-${pdfUrl}-${currentPage}`"
          :page-number="currentPage"
          :project-id="projectId"
          :document-id="documentId"
          :file-id="fileId"
          :file-version="fileVersion"
          :highlighted-comment-id="highlightedCommentId"
          :markers-expanded="markersExpanded"
          :show-all-comments="showAllComments"
          :show-my-comments="showMyComments"
          :current-user="currentUser"
          :project-members="projectMembers"
          @reply-to-comment="(c) => emit('reply-to-comment', c)"
          @share-comment="(c) => emit('share-comment', c)"
        />
      </div>

      <!-- Bottom controls: full toolbar -->
      <Controls
        variant="bottom"
        :current-page="currentPage"
        :page-count="pageCount"
        :versioning-enabled="versioningEnabled"
        :marker-enabled="markerEnabled"
        @toggle-marker="onToggleMarker"
        @show-all-comments="emit('show-all-comments')"
        @show-my-comments="emit('show-my-comments')"
        @expand-all-comments="emit('expand-all-comments')"
        @collapse-all-comments="emit('collapse-all-comments')"
        @show-version-history="emit('show-version-history')"
        @confirm-version="emit('confirm-version')"
        @show-document-info="emit('show-document-info')"
        @download="emit('download')"
        @print="emit('print')"
        @share="emit('share')"
      />
    </div>
  </div>
</template>

<style scoped>
.pdf-file.marker-active {
  cursor: crosshair;
}
</style>
