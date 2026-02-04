<script setup lang="ts">
import { onMounted, provide, ref, watch } from "vue";
import Markers from "@/components/pdf-viewer/Markers.vue";
import { createLoadingTask } from "vue3-pdfjs";
import type { PDFDocumentProxy } from "pdfjs-dist";
import Controls from "@/components/pdf-viewer/Controls.vue";
import { useMainStore } from "@/stores/mainStore.ts";

interface Props {
  pdfUrl: string;
  projectId: string;
  documentId: string;
  fileId: string;
}

const props = defineProps<Props>();

const appState = useMainStore();
const currentPage = ref(1);
const pdfLoaded = ref(false);
const pageCount = ref(0);
const pdfComponent = ref(null)
const markerEnabled = ref(appState.documentMarker);

provide('pdfComponentRef', pdfComponent)

const onPageUpdate = (page: number) => {
  currentPage.value = page;
}

const onToggleMarker = (mode: boolean) => {
  markerEnabled.value = mode;
  pdfComponent.value.$el.classList.toggle("marker-active");
}

onMounted(() => {
  const loadingTask = createLoadingTask(props.pdfUrl)
  loadingTask.promise.then((pdf: PDFDocumentProxy) => {
    pageCount.value = pdf.numPages
    pdfLoaded.value = true;
  })
});

appState.$subscribe((mutations, state) => {
  markerEnabled.value = state.documentMarker;
  if (markerEnabled.value) {
    pdfComponent.value.$el.classList.add("marker-active");
  } else {
    pdfComponent.value.$el.classList.remove("marker-active");
  }
})
</script>

<template>
  <div class="pdf-container">
    <div class="pdf-viewer-wrapper">

      <Controls
          :current-page="currentPage"
          :page-count="pageCount"
          @toggle-marker="onToggleMarker"
          @update:page="onPageUpdate"
      />

      <VuePdf
          ref="pdfComponent"
          :src="pdfUrl"
          :page="currentPage"
          :key="currentPage"
          class="pdf-file"
      />

      <Markers
          :key="currentPage"
          :page-number="currentPage"
          :project-id="projectId"
          :document-id="documentId"
          :file-id="fileId"
      />

      <Controls
          :current-page="currentPage"
          :page-count="pageCount"
          @toggle-marker="onToggleMarker"
          @update:page="onPageUpdate"
      />
    </div>
  </div>

  <div class="flex mt-3 flex-row">

  </div>
</template>

<style scoped>
.pdf-file {
  &.marker-active {
    cursor: crosshair;
  }
}
.pdf-container {
  position: relative;
  width: 100%;
  height: 800px;
  border: 1px solid #ccc;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pdf-viewer-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
}

.pdf-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
  gap: 15px;
}
button {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}
</style>