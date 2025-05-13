<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Document } from "@/types"
import { useDocuments } from "@/composables/useDocuments.js";
import { useComments } from "@/composables/useComments.ts";
import PDFWrapper from "@/components/pdf-viewer/PDFWrapper.vue";

interface Props {
  documentId: string;
}

const props = defineProps<Props>();
const baseUrl = window.location.origin;

const documentsApi = useDocuments();
const commentsApi = useComments();

const loading = ref(true);

// Get document and markers data
const document = ref<Document | null>(null);

const allMarkers = computed(() => {
  if (loading.value) {
    return [];
  }

  return commentsApi.getCommentsByDocumentId(props.documentId)
});

// Calculate counts
const unresolvedCount = computed(() => {
  if (loading.value) {
    return 0;
  }

  return commentsApi.getUnresolvedComments(props.documentId).length
});
const resolvedCount = computed(() => {
  if (loading.value) {
    return 0;
  }

  return allMarkers.value.filter(marker => marker.isResolved).length
});

// Load document and markers on component creation
onMounted(async () => {
  try {
    await documentsApi.getDocumentById(props.documentId).then(doc => {
      document.value = doc;
    })
    await commentsApi.fetchComments(props.documentId).then(() => {
      loading.value = false;
    })

  } catch (error) {
    console.error('Error loading document:', error);
  } finally {
  }
});
</script>

<template>
  <div class="document-viewer">
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading document...</p>
    </div>

    <template v-else>
      <div class="document-header">
        <h1>{{ document?.title }}</h1>
        <div class="document-stats">
          <span class="unresolved-count" v-if="unresolvedCount > 0">
            {{ unresolvedCount }} unresolved comments
          </span>
          <span class="resolved-count" v-if="resolvedCount > 0">
            {{ resolvedCount }} resolved
          </span>
        </div>
      </div>

      <!-- PDF Marker Viewer Component -->
      <PDFWrapper v-if="!loading"
          :pdf-url="`${baseUrl}/pdfs/${document?.filename}`"
          :document-id="documentId"

      />

      <!--CommentTable :document-id="documentId" /-->

    </template>
  </div>
</template>

<style scoped>
.document-viewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.document-stats {
  display: flex;
  gap: 10px;
}

.unresolved-count {
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.resolved-count {
  background-color: #2ecc71;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3498db;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.document-viewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.unresolved-count {
  background-color: #e74c3c;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 14px;
}
</style>