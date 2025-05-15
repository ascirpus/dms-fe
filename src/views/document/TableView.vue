<template>

  <div class="documents-list">
    <div class="page-header">
      <h1>Documents</h1>
      <button class="upload-btn">Upload New Document</button>
    </div>

    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Loading documents...</p>
    </div>

    <div v-else-if="documents.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h2>No Documents Found</h2>
      <p>Upload a document to get started</p>
    </div>

    <div v-else class="documents-grid">
      <div
          v-for="doc in documents"
          :key="doc.id"
          class="document-card"
          @click="openDocument(doc.id)"
      >
        <div class="document-thumbnail">
          <span class="file-icon">📄</span>
        </div>
        <div class="document-info">
          <h3 class="document-title">{{ doc.title }}</h3>
          <p class="document-meta">
            <span>{{ doc.status }}</span>
            <span>{{ formatDate(doc.uploadedDate) }}</span>
          </p>
          <div class="document-stats" v-if="getUnresolvedCount(doc.id) > 0">
            <span class="unresolved-badge">
              {{ getUnresolvedCount(doc.id) }} comment{{ getUnresolvedCount(doc.id) > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useComments } from "@/composables/useComments.ts";
import { useDocuments } from "@/composables/useDocuments.ts";

export default defineComponent({
  name: 'DocumentsListView',

  setup() {
    const router = useRouter();
    const documentsApi = useDocuments();
    const commentsApi = useComments();

    const loading = ref(true);
    const documents = documentsApi.documents;

    // Get unresolved count for a document
    const getUnresolvedCount = (documentId) => {
      return commentsApi.getUnresolvedComments(documentId).length;
    };

    // Navigate to document viewer
    const openDocument = (documentId) => {
      router.push({ name: 'document-details', params: { id: documentId } });
    };

    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    // Load documents on component creation
    onMounted(async () => {
      try {
        await documentsApi.fetchDocuments();

        // After loading documents, fetch markers for all documents
        // In a real app, you might want to optimize this for large collections
        await Promise.all(
            documents.value.map(doc => commentsApi.fetchComments(doc.id))
        );
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      loading,
      documents,
      getUnresolvedCount,
      openDocument,
      formatFileSize,
      formatDate
    };
  }
});
</script>

<style scoped>
.documents-list {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.upload-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #2980b9;
}

.loading-indicator,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.document-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  background-color: white;
}

.document-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.document-thumbnail {
  height: 150px;
  background-color: var(--light-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
}

.file-icon {
  font-size: 3rem;
}

.document-info {
  padding: 1rem;
}

.document-title {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.document-stats {
  margin-top: 0.5rem;
}

.unresolved-badge {
  background-color: #e74c3c;
  color: white;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}
</style>