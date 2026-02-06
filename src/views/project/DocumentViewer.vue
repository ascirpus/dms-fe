<script setup lang="ts">
import { ref, computed, watch, provide, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DocumentStatus, type Document } from '@/types/Document';
import type { TenantUser } from '@/services/UsersService';

import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import FileUpload from 'primevue/fileupload';

import PDFWrapper from '@/components/pdf-viewer/PDFWrapper.vue';
import CommentTable from '@/components/pdf-viewer/CommentTable.vue';

import { useAuth } from '@/composables/useAuth';
import { useComments } from '@/composables/useComments';
import { useProjects, useProjectDocuments } from '@/composables/useProjects';
import { useTenantFeatures } from '@/composables/useTenantFeatures';
import { DocumentsService } from '@/services/DocumentsService';
import { getAvatarColor, getInitialsFromUser } from '@/utils/avatar';

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const { useResolvedProjectId, fetchProjectById, fetchProjectMembers, loading: projectsLoading } = useProjects();
const { comments, fetchComments } = useComments();
const { versioningEnabled, fetchTenant } = useTenantFeatures();
const documentsService = new DocumentsService(auth.apiClient);

provide('comments', comments);

// Resolve slug URLs to full IDs
const projectSlug = computed(() => route.params.id as string);
const documentSlug = computed(() => route.params.documentId as string);
const projectId = useResolvedProjectId(projectSlug);

const { useResolvedDocumentId, resolveDocument, loading: documentsLoading } = useProjectDocuments(() => projectId.value);
const documentId = useResolvedDocumentId(documentSlug);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const document = ref<Document | null>(null);
const project = ref<{ name: string } | null>(null);
const projectMembers = ref<TenantUser[]>([]);
const pdfWrapperRef = ref<InstanceType<typeof PDFWrapper> | null>(null);
const highlightedCommentId = ref<string | null>(null);

// Active file version for PDF viewing
const activeFileId = ref<string>('');

// PDF blob URL for authenticated viewing
const pdfBlobUrl = ref<string>('');

async function fetchPdfBlob(projectId: string, docId: string, fileId: string) {
  if (!docId || !fileId) {
    pdfBlobUrl.value = '';
    return;
  }

  // Revoke previous blob URL to avoid memory leaks
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value);
    pdfBlobUrl.value = '';
  }

  try {
    const response = await auth.apiClient.get(
      `/api/projects/${projectId}/documents/${docId}/files/${fileId}`,
      { responseType: 'arraybuffer' },
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    pdfBlobUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error fetching PDF:', err);
    pdfBlobUrl.value = '';
  }
}

// Sidebar state
const sidebarOpen = ref(true);
const activeTab = ref<'comments' | 'versions'>('comments');

// Comment filter state
const showAllComments = ref(false);
const showMyComments = ref(false);
const markersExpanded = ref(true);

const currentUser = computed(() => auth.getCurrentUser());

const versionCommentCount = computed(() =>
  comments.value.filter(c => c.fileId === activeFileId.value).length
);

// Dialogs
const showAddVersionDialog = ref(false);
const showInviteUserDialog = ref(false);
const showDocumentInfoDialog = ref(false);

// Upload state
const uploading = ref(false);
const uploadFile = ref<File | null>(null);

// Wait for both projects and documents to load before fetching data
watch(
  [projectsLoading, documentsLoading],
  ([projLoading, docsLoading]) => {
    if (!projLoading && !docsLoading && !document.value) {
      fetchData();
    }
  },
  { immediate: true },
);

async function fetchData() {
  if (projectsLoading.value || documentsLoading.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Fetch project and tenant features in parallel
    const [projectResponse] = await Promise.all([
      fetchProjectById(projectId.value),
      fetchTenant().catch(() => {}),
    ]);
    project.value = { name: projectResponse.name };

    // Fetch project members (non-blocking)
    fetchProjectMembers(projectId.value)
      .then(members => { projectMembers.value = members; })
      .catch(() => {});

    // Always fetch the full document to get file/version details
    const fetchedDoc = await documentsService.fetchDocumentById(projectId.value, documentId.value);
    document.value = fetchedDoc;
    activeFileId.value = fetchedDoc.currentVersion?.id ?? '';

    // Fetch the PDF through the authenticated client
    await fetchPdfBlob(projectId.value, fetchedDoc.id, activeFileId.value);

    // Fetch comments
    await fetchComments(projectId.value, documentId.value);

    // Navigate to linked comment if URL has a hash
    await nextTick();
    navigateToLinkedComment();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching document:', err);
  } finally {
    loading.value = false;
  }
}

// Version switching
async function switchVersion(fileId: string) {
  activeFileId.value = fileId;
  if (document.value) {
    await fetchPdfBlob(projectId.value, document.value.id, fileId);
  }
}

// Active version object
const activeVersion = computed(() => {
  return document.value?.versions?.find(v => v.fileId === activeFileId.value);
});

function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${day}.${month}.${year} ${hour12}:${minutes} ${ampm}`;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function openSidebar() {
  sidebarOpen.value = true;
}

function onJumpToMarker(pageNumber: number, commentId?: string) {
  if (commentId) {
    highlightedCommentId.value = commentId;
    setTimeout(() => { highlightedCommentId.value = null; }, 2000);
  }
  const markerY = commentId
    ? comments.value.find(c => c.id === commentId)?.marker?.position?.y
    : undefined;
  pdfWrapperRef.value?.jumpToPage(pageNumber, markerY);
}

function onReplyToComment(_comment: any) {
  sidebarOpen.value = true;
  activeTab.value = 'comments';
}

function onShareComment(comment: any) {
  const url = new URL(window.location.href);
  url.hash = comment.id;
  navigator.clipboard.writeText(url.toString());
}

async function navigateToLinkedComment() {
  const commentId = route.hash?.replace('#', '');
  if (!commentId) return;

  const comment = comments.value.find(c => c.id === commentId);
  if (!comment) return;

  // Switch to the correct file version if needed
  if (comment.fileId && comment.fileId !== activeFileId.value) {
    activeFileId.value = comment.fileId;
    if (document.value) {
      await fetchPdfBlob(projectId.value, document.value.id, comment.fileId);
    }
  }

  // Jump to the marker's page and scroll to it
  await nextTick();
  if (comment.marker) {
    onJumpToMarker(comment.marker.pageNumber, comment.id);
  }

  // Clear the hash so it doesn't re-trigger
  router.replace({ ...route, hash: '' });
}

// Bottom toolbar event handlers
function onShowAllComments() {
  showAllComments.value = !showAllComments.value;
  if (showAllComments.value) showMyComments.value = false;
}

function onShowMyComments() {
  showMyComments.value = !showMyComments.value;
  if (showMyComments.value) showAllComments.value = false;
}

function onExpandAllComments() {
  markersExpanded.value = true;
}

function onCollapseAllComments() {
  markersExpanded.value = false;
}

function onShowVersionHistory() {
  sidebarOpen.value = true;
  activeTab.value = 'versions';
}

async function onConfirmVersion() {
  if (!document.value) return;
  try {
    await documentsService.approveDocument(projectId.value, document.value.id);
    document.value.status = DocumentStatus.APPROVED;
  } catch (err) {
    console.error('Error approving document:', err);
  }
}

function onShowDocumentInfo() {
  showDocumentInfoDialog.value = true;
}

function onDownload() {
  if (pdfBlobUrl.value) {
    const a = window.document.createElement('a');
    a.href = pdfBlobUrl.value;
    a.download = document.value?.title ? `${document.value.title}.pdf` : 'document.pdf';
    a.click();
  }
}

function onPrint() {
  if (pdfBlobUrl.value) {
    window.open(pdfBlobUrl.value, '_blank');
  }
}

function onShare() {
  navigator.clipboard.writeText(window.location.href);
}

function onFileSelect(event: { files: File[] }) {
  uploadFile.value = event.files?.[0] ?? null;
}

async function uploadNewVersion() {
  if (!uploadFile.value || !document.value) return;

  uploading.value = true;

  try {
    await documentsService.uploadVersion(
      projectId.value,
      document.value.id,
      uploadFile.value,
      {
        title: document.value.title,
        document_type_id: document.value.documentType?.id ?? '',
      },
    );

    // Re-fetch document to get updated version data (backend returns Unit)
    const refreshedDoc = await documentsService.fetchDocumentById(projectId.value, document.value.id);
    document.value = refreshedDoc;
    activeFileId.value = refreshedDoc.currentVersion?.id ?? '';
    await fetchPdfBlob(projectId.value, refreshedDoc.id, activeFileId.value);

    showAddVersionDialog.value = false;
    uploadFile.value = null;
  } catch (err) {
    console.error('Error uploading version:', err);
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="document-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p class="loading-text">Loading document...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <h3>Error loading document</h3>
      <p>{{ error }}</p>
      <Button icon="pi pi-refresh" label="Try Again" @click="fetchData" />
    </div>

    <!-- Document Content -->
    <template v-else-if="document">
      <!-- Document Header -->
      <div class="document-header">
        <div class="header-left">
          <span class="project-name">{{ project?.name }}</span>
          <h1 class="document-title">{{ document.title }}</h1>
        </div>
        <div class="header-right">
          <Button
            v-if="versioningEnabled"
            icon="pi pi-plus"
            label="Add Version"
            @click="showAddVersionDialog = true"
          />
          <Button
            icon="pi pi-send"
            label="Invite User"
            severity="secondary"
            @click="showInviteUserDialog = true"
          />
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="document-content">
        <!-- PDF Viewer Area -->
        <div class="pdf-viewer-container">
          <PDFWrapper
            v-if="pdfBlobUrl"
            ref="pdfWrapperRef"
            :pdf-url="pdfBlobUrl"
            :project-id="projectId"
            :document-id="documentId"
            :file-id="activeFileId"
            :file-version="activeVersion?.version ?? 1"
            :versioning-enabled="versioningEnabled"
            :project-members="projectMembers"
            :highlighted-comment-id="highlightedCommentId"
            :markers-expanded="markersExpanded"
            :show-all-comments="showAllComments"
            :show-my-comments="showMyComments"
            :current-user="currentUser"
            @show-all-comments="onShowAllComments"
            @show-my-comments="onShowMyComments"
            @expand-all-comments="onExpandAllComments"
            @collapse-all-comments="onCollapseAllComments"
            @show-version-history="onShowVersionHistory"
            @confirm-version="onConfirmVersion"
            @show-document-info="onShowDocumentInfo"
            @download="onDownload"
            @print="onPrint"
            @share="onShare"
            @reply-to-comment="onReplyToComment"
            @share-comment="onShareComment"
          />
        </div>

        <!-- Right Sidebar -->
        <div v-if="sidebarOpen" class="sidebar">
          <div class="sidebar-header">
            <div class="sidebar-tabs">
              <button
                class="sidebar-tab"
                :class="{ active: activeTab === 'comments' }"
                @click="activeTab = 'comments'"
              >
                {{ versionCommentCount }} Comments
              </button>
              <button
                v-if="versioningEnabled"
                class="sidebar-tab"
                :class="{ active: activeTab === 'versions' }"
                @click="activeTab = 'versions'"
              >
                Version History
              </button>
            </div>
            <Button
              icon="pi pi-times"
              text
              rounded
              size="small"
              @click="closeSidebar"
              aria-label="Close sidebar"
            />
          </div>

          <!-- Comments Tab -->
          <div v-if="activeTab === 'comments'" class="sidebar-content">
            <CommentTable
              :project-id="projectId"
              :document-id="documentId"
              :file-id="activeFileId"
              :file-version="activeVersion?.version ?? 1"
              :current-user="currentUser"
              @jump-to-marker="onJumpToMarker"
            />
          </div>

          <!-- Version History Tab -->
          <div v-if="activeTab === 'versions'" class="sidebar-content">
            <div class="versions-list">
              <div
                v-for="version in document.versions"
                :key="version.fileId"
                class="version-item"
                :class="{ 'version-active': version.fileId === activeFileId }"
                @click="switchVersion(version.fileId)"
              >
                <span
                  class="version-avatar"
                  :style="{ backgroundColor: getAvatarColor(`v${version.version}`) }"
                >
                  v{{ version.version }}
                </span>
                <div class="version-content">
                  <div class="version-user">Version {{ version.version }}</div>
                  <div class="version-meta">
                    <span class="version-date">{{ formatDate(version.uploadedAt) }}</span>
                  </div>
                </div>
                <i v-if="version.fileId === document.currentVersion?.id" class="pi pi-check version-current-badge"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Toggle (when closed) -->
        <Button
          v-if="!sidebarOpen"
          icon="pi pi-comments"
          class="sidebar-toggle"
          @click="openSidebar"
          aria-label="Open sidebar"
        />
      </div>
    </template>

    <!-- Document Info Dialog -->
    <Dialog
      v-model:visible="showDocumentInfoDialog"
      header="Document Information"
      modal
      :style="{ width: '640px' }"
    >
      <div class="info-dialog-content">
        <div class="info-row">
          <div class="info-field">
            <FloatLabel variant="on">
              <InputText
                id="docVersion"
                :model-value="activeVersion ? `v${activeVersion.version}` : 'v1'"
                class="w-full"
                readonly
              />
              <label for="docVersion">Version</label>
            </FloatLabel>
          </div>
          <div class="info-field">
            <FloatLabel variant="on">
              <InputText
                id="docAddedBy"
                :model-value="document?.currentVersion?.uploadedBy ?? ''"
                class="w-full"
                readonly
              />
              <label for="docAddedBy">Added By</label>
            </FloatLabel>
          </div>
        </div>
        <div class="info-row">
          <div class="info-field">
            <FloatLabel variant="on">
              <InputText
                id="docDateUploaded"
                :model-value="activeVersion ? formatDate(activeVersion.uploadedAt) : ''"
                class="w-full"
                readonly
              />
              <label for="docDateUploaded">Date Uploaded</label>
            </FloatLabel>
          </div>
          <div class="info-field">
            <FloatLabel variant="on">
              <InputText
                id="docStatus"
                :model-value="document?.status"
                class="w-full"
                readonly
              />
              <label for="docStatus">Status</label>
            </FloatLabel>
          </div>
        </div>
        <div class="info-row">
          <div class="info-field full-width">
            <FloatLabel variant="on">
              <InputText
                id="docDescription"
                :model-value="document?.description ?? ''"
                class="w-full"
                readonly
              />
              <label for="docDescription">Description</label>
            </FloatLabel>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Close" @click="showDocumentInfoDialog = false" />
      </template>
    </Dialog>

    <!-- Add Version Dialog -->
    <Dialog
      v-model:visible="showAddVersionDialog"
      header="Add New Version"
      modal
      :style="{ width: '500px' }"
    >
      <div class="upload-form">
        <FileUpload
          mode="basic"
          accept=".pdf"
          :maxFileSize="104857600"
          chooseLabel="Choose File"
          :auto="false"
          @select="onFileSelect"
        />
        <p v-if="uploadFile" class="upload-filename">
          <i class="pi pi-file-pdf"></i>
          {{ uploadFile.name }}
        </p>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showAddVersionDialog = false" />
        <Button
          label="Upload"
          icon="pi pi-upload"
          :disabled="!uploadFile"
          :loading="uploading"
          @click="uploadNewVersion"
        />
      </template>
    </Dialog>

    <!-- Invite User Dialog -->
    <Dialog
      v-model:visible="showInviteUserDialog"
      header="Invite User"
      modal
      :style="{ width: '450px' }"
    >
      <div class="invite-form">
        <FloatLabel variant="on">
          <InputText id="inviteEmail" class="w-full" />
          <label for="inviteEmail">Email Address</label>
        </FloatLabel>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showInviteUserDialog = false" />
        <Button label="Send Invite" icon="pi pi-send" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.document-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: var(--surface-ground);
}

/* Loading & Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
}

.loading-text {
  color: var(--text-secondary);
}

.error-container i {
  font-size: 48px;
  color: var(--red-500);
}

.error-container h3 {
  margin: 0;
  color: var(--text-color);
}

.error-container p {
  color: var(--text-secondary);
  margin: 0;
}

/* Document Header */
.document-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  background-color: var(--surface-card);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-name {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}

.document-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Document Content */
.document-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

/* PDF Viewer */
.pdf-viewer-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-card);
  border-radius: 10px;
  overflow: hidden;
}

.pdf-viewer-container :deep(.pdf-container) {
  height: 100%;
  border: none;
  border-radius: 10px;
}

.pdf-viewer-container :deep(.top-controls) {
  border-radius: 10px 10px 0 0;
}

.pdf-viewer-container :deep(.bottom-controls) {
  border-radius: 0 0 10px 10px;
}

/* Sidebar */
.sidebar {
  width: 320px;
  background-color: var(--surface-card);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-bottom: 1px solid var(--surface-border);
  flex-shrink: 0;
}

.sidebar-tabs {
  display: flex;
}

.sidebar-tab {
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-tab:hover {
  color: var(--text-color);
}

.sidebar-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

/* Version List */
.versions-list {
  display: flex;
  flex-direction: column;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--surface-border);
  cursor: pointer;
  transition: background 0.15s;
}

.version-item:hover {
  background-color: var(--surface-hover, #f8fafc);
}

.version-item.version-active {
  background-color: color-mix(in srgb, var(--primary-color) 8%, transparent);
}

.version-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  color: white;
  font-size: 11px;
  font-weight: 600;
  user-select: none;
}

.version-content {
  flex: 1;
}

.version-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.version-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
}

.version-number {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary-color);
}

.version-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.version-current-badge {
  color: #27ae60;
  font-size: 14px;
}

/* Sidebar Toggle */
.sidebar-toggle {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

/* Dialogs */
.info-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-row {
  display: flex;
  gap: 24px;
}

.info-field {
  flex: 1;
}

.info-field.full-width {
  flex-basis: 100%;
}

.upload-form {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-filename {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 14px;
  margin: 0;
}

.invite-form {
  padding: 16px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .document-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 300px;
  }

  .document-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-right {
    align-self: flex-start;
  }
}
</style>
