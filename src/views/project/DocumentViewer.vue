<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Document } from '@/types/Document';

// PrimeVue Components
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Menu from 'primevue/menu';

// Existing PDF Viewer Components
import PDFWrapper from '@/components/pdf-viewer/PDFWrapper.vue';
import CommentTable from '@/components/pdf-viewer/CommentTable.vue';

import { useAuth } from "@/composables/useAuth";
import { useComments } from "@/composables/useComments";
import { useProjects, useProjectDocuments } from "@/composables/useProjects";

import logoImage from "@/assets/images/logo.svg";

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const { useResolvedProjectId, fetchProjectById, loading: projectsLoading } = useProjects();
const { comments, fetchComments } = useComments();

// Provide comments to child components
provide('comments', comments);

// Resolve slug URLs to full IDs (reactive - updates when data loads)
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

// Sidebar state
const sidebarOpen = ref(true);
const activeTab = ref<'comments' | 'versions'>('comments');

// Version history (mock for now)
const versions = ref([
  { id: '1', user: 'John Doe', date: new Date('2024-01-15T10:30:00') },
  { id: '2', user: 'Jane Smith', date: new Date('2024-01-14T14:22:00') },
  { id: '3', user: 'Bob Wilson', date: new Date('2024-01-13T09:15:00') },
  { id: '4', user: 'Alice Brown', date: new Date('2024-01-12T16:45:00') },
]);

// PDF URL for the viewer
const pdfUrl = computed(() => {
  if (!document.value?.id) return '';
  return `/api/projects/${projectId.value}/documents/${document.value.id}/content`;
});

// User menu
const userMenu = ref();
const currentUser = computed(() => auth.getCurrentUser());
const pictureUrl = computed(() => currentUser.value?.picture || '');
const userInitials = computed(() => auth.getInitials());

const userMenuItems = computed(() => [
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push({ name: 'profile' })
  },
  {
    label: 'Sign Out',
    icon: 'pi pi-sign-out',
    command: () => auth.logout()
  }
]);

// Dialogs
const showAddVersionDialog = ref(false);
const showInviteUserDialog = ref(false);
const showDocumentInfoDialog = ref(false);

// Wait for both projects and documents to load before fetching data
watch(
  [projectsLoading, documentsLoading],
  ([projLoading, docsLoading]) => {
    if (!projLoading && !docsLoading && !document.value) {
      fetchData();
    }
  },
  { immediate: true }
);

async function fetchData() {
  // Don't fetch while data is still loading (IDs not resolved yet)
  if (projectsLoading.value || documentsLoading.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Fetch project
    const projectResponse = await fetchProjectById(projectId.value);
    project.value = { name: projectResponse.name };

    // Resolve document from cache (populated by useProjectDocuments)
    const doc = resolveDocument(documentSlug.value);
    if (doc) {
      document.value = doc;
    } else {
      throw new Error('Document not found');
    }

    // Fetch comments for this document
    await fetchComments(documentId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching document:', err);
  } finally {
    loading.value = false;
  }
}

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

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function toggleUserMenu(event: Event) {
  userMenu.value?.toggle(event);
}

function goToProjects() {
  router.push({ name: 'projects' });
}

function goToDocuments() {
  router.push({ name: 'project-details', params: { id: projectSlug.value } });
}

function openDocumentInfo() {
  showDocumentInfoDialog.value = true;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function openSidebar() {
  sidebarOpen.value = true;
}

function onJumpToMarker(pageNumber: number) {
  // The PDFWrapper handles page navigation internally
  console.log('Jump to page:', pageNumber);
}
</script>

<template>
  <div class="document-view">
    <!-- Top Navigation Bar -->
    <header class="top-nav">
      <div class="nav-left">
        <div class="logo" @click="goToProjects">
          <img :src="logoImage" alt="Logo" class="logo-image" />
        </div>
        <div class="nav-buttons">
          <Button
            label="Projects"
            text
            class="nav-button"
            @click="goToProjects"
          />
          <Button
            label="Documents"
            text
            class="nav-button"
            @click="goToDocuments"
          />
        </div>
      </div>
      <div class="nav-right">
        <Button
          icon="pi pi-bell"
          text
          rounded
          aria-label="Notifications"
          @click="router.push({ name: 'notifications' })"
        />
        <Avatar
          :label="pictureUrl ? undefined : userInitials"
          :image="pictureUrl"
          shape="circle"
          class="user-avatar"
          :class="{ 'avatar-with-initials': !pictureUrl }"
          @click="toggleUserMenu"
        />
        <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
      </div>
    </header>

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
    <template v-else>
      <!-- Document Header -->
      <div class="document-header">
        <div class="header-left">
          <span class="project-name">{{ project?.name }}</span>
          <h1 class="document-title">{{ document?.title }}</h1>
        </div>
        <div class="header-right">
          <Button
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
            v-if="pdfUrl"
            :pdf-url="pdfUrl"
            :document-id="documentId"
          />
        </div>

        <!-- Right Sidebar -->
        <div v-if="sidebarOpen" class="sidebar">
          <!-- Sidebar Tabs -->
          <div class="sidebar-header">
            <div class="sidebar-tabs">
              <button
                class="sidebar-tab"
                :class="{ active: activeTab === 'comments' }"
                @click="activeTab = 'comments'"
              >
                {{ comments.length }} Comments
              </button>
              <button
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
              :document-id="documentId"
              @jump-to-marker="onJumpToMarker"
            />
          </div>

          <!-- Version History Tab -->
          <div v-if="activeTab === 'versions'" class="sidebar-content">
            <div class="versions-list">
              <div
                v-for="version in versions"
                :key="version.id"
                class="version-item"
              >
                <Avatar
                  :label="getInitials(version.user)"
                  shape="circle"
                  class="version-avatar"
                />
                <div class="version-content">
                  <div class="version-user">{{ version.user }}</div>
                  <div class="version-date">{{ formatDate(version.date) }}</div>
                </div>
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
                id="docName"
                :model-value="document?.title"
                class="w-full"
                readonly
              />
              <label for="docName">Document Name</label>
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
          <div class="info-field">
            <FloatLabel variant="on">
              <InputText
                id="docVersion"
                :model-value="String(document?.version || 1)"
                class="w-full"
                readonly
              />
              <label for="docVersion">Version</label>
            </FloatLabel>
          </div>
          <div class="info-field">
            <FloatLabel variant="on">
              <InputText
                id="docProject"
                :model-value="project?.name"
                class="w-full"
                readonly
              />
              <label for="docProject">Project</label>
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
      <p>Upload a new version of this document.</p>
      <template #footer>
        <Button label="Cancel" text @click="showAddVersionDialog = false" />
        <Button label="Upload" icon="pi pi-upload" />
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
  height: 100vh;
  background-color: var(--surface-ground);
}

/* Top Navigation */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  height: 66px;
  flex-shrink: 0;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-image {
  height: 42px;
  width: auto;
}

.nav-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-button {
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  cursor: pointer;
}

.avatar-with-initials {
  background-color: var(--primary-color);
  color: white;
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

.pdf-viewer-container :deep(.pdf-controls) {
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
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
  padding: 0;
}

/* Override CommentTable styles for sidebar */
.sidebar-content :deep(.comment-list) {
  margin-top: 0;
  padding: 12px;
}

.sidebar-content :deep(.comment-list h2) {
  display: none;
}

.sidebar-content :deep(.comment-card) {
  padding: 12px;
  margin-bottom: 8px;
}

/* Version List */
.versions-list {
  display: flex;
  flex-direction: column;
}

.version-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--surface-border);
  cursor: pointer;
}

.version-item:hover {
  background-color: var(--surface-hover);
}

.version-avatar {
  flex-shrink: 0;
  background-color: var(--primary-color);
  color: white;
}

.version-content {
  flex: 1;
}

.version-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.version-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
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

  .nav-buttons {
    display: none;
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
