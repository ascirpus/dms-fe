<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkspace } from '@/composables/useWorkspace';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'primevue/usetoast';
import { ProjectsService, type ProjectListItem } from '@/services/ProjectsService';
import { DocumentsService } from '@/services/DocumentsService';
import type { Document } from '@/types/Document';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const toast = useToast();
const { apiClient } = useAuth();
const { currentWorkspace, fetchCurrentWorkspace } = useWorkspace();

const loading = ref(true);

interface CleanupItem {
  type: 'project' | 'document';
  name: string;
  projectName?: string;
  projectId: string;
  documentId?: string;
  lastActivity: string;
  fileSize?: number;
}

const cleanupItems = ref<CleanupItem[]>([]);

const tierName = computed(() => currentWorkspace.value?.tier.name ?? '');
const usage = computed(() => currentWorkspace.value?.usage);
const tier = computed(() => currentWorkspace.value?.tier);
const features = computed(() => currentWorkspace.value?.tier.features ?? []);

const usageMetrics = computed(() => {
  if (!usage.value || !tier.value) return [];

  return [
    {
      label: 'Projects',
      current: usage.value.projectsCount,
      max: tier.value.maxProjects,
      icon: 'pi-folder',
    },
    {
      label: 'Documents',
      current: usage.value.documentsCount,
      max: tier.value.maxDocumentsPerProject,
      icon: 'pi-file',
    },
    {
      label: 'Storage',
      current: usage.value.storageUsedMb,
      max: tier.value.maxStorageMb,
      icon: 'pi-database',
      formatter: formatStorage,
    },
  ];
});

const anyUsageAbove80 = computed(() =>
  usageMetrics.value.some(m => m.max !== undefined && getPercentage(m.current, m.max) > 80)
);

function getPercentage(current: number, max?: number): number {
  if (max === undefined || max === 0) return 0;
  return Math.min(100, Math.max(0, (current / max) * 100));
}

function formatUsageValue(current: number, max?: number, formatter?: (v: number) => string): string {
  const fmt = formatter ?? ((v: number) => v.toString());
  if (max === undefined) return `${fmt(current)} / Unlimited`;
  return `${fmt(current)} / ${fmt(max)}`;
}

function formatStorage(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

function formatFeatureName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bOcr\b/, 'OCR').replace(/\bApi\b/, 'API');
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function getProgressSeverity(current: number, max?: number): string | undefined {
  if (max === undefined) return undefined;
  const pct = getPercentage(current, max);
  if (pct > 90) return 'danger';
  if (pct > 80) return 'warn';
  return undefined;
}

function navigateToItem(item: CleanupItem) {
  if (item.type === 'project') {
    router.push({ name: 'project-details', params: { id: item.projectId } });
  } else if (item.documentId) {
    router.push({ name: 'project-document', params: { id: item.projectId, documentId: item.documentId } });
  }
}

function onUpgradeClick() {
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Plan upgrades will be available soon.',
    life: 3000,
  });
}

async function fetchCleanupSuggestions() {
  try {
    const projectsApi = new ProjectsService(apiClient);
    const documentsApi = new DocumentsService(apiClient);

    const projectItems = await projectsApi.fetchProjects();
    const items: CleanupItem[] = [];

    for (const item of projectItems) {
      const project = item.project;
      items.push({
        type: 'project',
        name: project.name,
        projectId: project.id,
        lastActivity: project.updatedAt?.toString() ?? project.createdAt?.toString() ?? '',
      });

      try {
        const docs = await projectsApi.fetchProjectDocuments(project.id);
        for (const doc of docs) {
          const latestVersion = doc.versions?.length
            ? doc.versions.reduce((a: any, b: any) => new Date(a.uploadedAt) < new Date(b.uploadedAt) ? a : b)
            : doc.currentVersion;

          items.push({
            type: 'document',
            name: doc.title,
            projectName: project.name,
            projectId: project.id,
            documentId: doc.id,
            lastActivity: latestVersion?.uploadedAt ?? '',
          });
        }
      } catch {
        // skip documents for projects we can't access
      }
    }

    items.sort((a, b) => {
      if (!a.lastActivity) return -1;
      if (!b.lastActivity) return 1;
      return new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
    });

    cleanupItems.value = items.slice(0, 10);
  } catch {
    // cleanup suggestions are non-critical
  }
}

onMounted(async () => {
  try {
    await fetchCurrentWorkspace();
    if (anyUsageAbove80.value) {
      await fetchCleanupSuggestions();
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="workspace-overview">
    <div class="workspace-content">
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <span>Loading workspace...</span>
      </div>

      <template v-else-if="currentWorkspace">
        <!-- Heading -->
        <div class="workspace-heading">
          <h1 class="workspace-name">{{ currentWorkspace.name }}</h1>
          <span class="tier-badge">{{ tierName }}</span>
        </div>

        <!-- Usage & Limits -->
        <div class="section-header">
          <h2 class="section-title">Usage &amp; Limits</h2>
        </div>

        <div class="usage-grid">
          <div v-for="metric in usageMetrics" :key="metric.label" class="usage-card">
            <div class="usage-card-header">
              <i :class="'pi ' + metric.icon" class="usage-icon"></i>
              <span class="usage-label">{{ metric.label }}</span>
            </div>
            <div class="usage-value">
              {{ formatUsageValue(metric.current, metric.max, metric.formatter) }}
            </div>
            <ProgressBar
              v-if="metric.max !== undefined"
              :value="getPercentage(metric.current, metric.max)"
              :showValue="false"
              :severity="getProgressSeverity(metric.current, metric.max)"
              class="usage-bar"
            />
            <div v-else class="usage-unlimited">Unlimited</div>
          </div>
        </div>

        <!-- Features -->
        <div class="section-header">
          <h2 class="section-title">Features</h2>
        </div>

        <div class="features-list">
          <div v-for="feature in features" :key="feature.feature" class="feature-item">
            <i
              :class="feature.enabled ? 'pi pi-check-circle feature-enabled' : 'pi pi-times-circle feature-disabled'"
            ></i>
            <span class="feature-name">{{ formatFeatureName(feature.feature) }}</span>
          </div>
          <div v-if="features.length === 0" class="empty-features">
            No features configured for this tier.
          </div>
        </div>

        <!-- Cleanup Suggestions -->
        <template v-if="anyUsageAbove80 && cleanupItems.length > 0">
          <div class="section-header">
            <h2 class="section-title">Cleanup Suggestions</h2>
          </div>
          <p class="section-subtitle">
            These items haven't been updated recently. Review them to free up space.
          </p>

          <div class="cleanup-list">
            <div
              v-for="(item, index) in cleanupItems"
              :key="index"
              class="cleanup-item"
              @click="navigateToItem(item)"
            >
              <i :class="item.type === 'project' ? 'pi pi-folder' : 'pi pi-file'" class="cleanup-icon"></i>
              <div class="cleanup-info">
                <span class="cleanup-name">{{ item.name }}</span>
                <span v-if="item.projectName" class="cleanup-context">in {{ item.projectName }}</span>
              </div>
              <span class="cleanup-date">{{ formatRelativeDate(item.lastActivity) }}</span>
              <span v-if="item.fileSize" class="cleanup-size">{{ formatFileSize(item.fileSize) }}</span>
            </div>
          </div>
        </template>

        <!-- Upgrade CTA -->
        <div class="section-header">
          <h2 class="section-title">Upgrade</h2>
        </div>

        <div class="upgrade-card">
          <h3 class="upgrade-heading">Need more from your workspace?</h3>
          <p class="upgrade-description">
            Unlock higher limits, advanced features, and priority support by upgrading your plan.
          </p>
          <Button
            label="Upgrade Plan"
            icon="pi pi-arrow-up"
            @click="onUpgradeClick"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.workspace-overview {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.workspace-content {
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px;
  color: var(--text-secondary);
}

/* Heading */
.workspace-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.workspace-name {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.25;
  color: var(--text-color);
  margin: 0;
}

.tier-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 8px;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.25;
  color: var(--text-color);
  margin: 0;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 16px 8px;
}

/* Usage Grid */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding: 0 16px 16px;
}

.usage-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.usage-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usage-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

.usage-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.usage-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
}

.usage-bar {
  height: 8px;
  border-radius: 4px;
}

.usage-unlimited {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Features */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
}

.feature-enabled {
  color: #27ae60;
  font-size: 16px;
}

.feature-disabled {
  color: var(--text-secondary);
  font-size: 16px;
}

.feature-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.empty-features {
  color: var(--text-secondary);
  font-size: 14px;
  padding: 10px 14px;
}

/* Cleanup */
.cleanup-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px 16px;
}

.cleanup-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.cleanup-item:hover {
  background-color: var(--surface-ground);
}

.cleanup-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

.cleanup-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cleanup-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cleanup-context {
  font-size: 12px;
  color: var(--text-secondary);
}

.cleanup-date {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cleanup-size {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

/* Upgrade */
.upgrade-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 24px;
  margin: 0 16px 16px;
}

.upgrade-heading {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px;
}

.upgrade-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 16px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .workspace-content {
    padding: 0 12px;
  }

  .usage-grid {
    grid-template-columns: 1fr;
  }
}
</style>
