<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkspace } from '@/composables/useWorkspace';
import { useAuth } from '@/composables/useAuth';
import { useBilling } from '@/composables/useBilling';
import { useToast } from 'primevue/usetoast';
import { ProjectsService, type ProjectListItem } from '@/services/ProjectsService';
import { DocumentsService } from '@/services/DocumentsService';
import type { Document } from '@/types/Document';
import type { BillingInterval, BillingPlan } from '@/types';
import ProgressBar from 'primevue/progressbar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import SelectButton from 'primevue/selectbutton';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const toast = useToast();
const { apiClient } = useAuth();
const { currentWorkspace, fetchCurrentWorkspace } = useWorkspace();
const { billingStatus, plans, isSubscribed, currentSubscription, fetchBillingStatus, fetchPlans, startCheckout, openBillingPortal, cancelSubscription } = useBilling();

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
  if (max === undefined || max === 2147483647) return `${fmt(current)} / Unlimited`;
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

const checkoutLoading = ref<string | null>(null);
const selectedInterval = ref<BillingInterval>('YEARLY');
const intervalOptions = [
  { label: 'Monthly', value: 'MONTHLY' as BillingInterval },
  { label: 'Yearly', value: 'YEARLY' as BillingInterval },
];

function getPlanPrice(plan: BillingPlan, interval: BillingInterval): number {
  return plan.prices.find(p => p.interval === interval)?.priceInCents ?? 0;
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

const tierRank = computed(() => currentWorkspace.value?.tier.rank ?? 0);

const isTopTier = computed(() => tierRank.value >= 2);

const isHighestTier = computed(() => tierRank.value >= 3);

const nextUpgradePlan = computed(() => {
  if (isTopTier.value) return null;
  const currentTierName = currentWorkspace.value?.tier.name?.toLowerCase() ?? '';
  const available = plans.value
    .filter(p => p.name.toLowerCase() !== currentTierName)
    .sort((a, b) => getPlanPrice(a, 'MONTHLY') - getPlanPrice(b, 'MONTHLY'));
  return available[0] ?? null;
});

async function onStartCheckout(planId: string) {
  checkoutLoading.value = planId;
  try {
    await startCheckout(planId, selectedInterval.value);
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not start checkout. Please try again.', life: 3000 });
  } finally {
    checkoutLoading.value = null;
  }
}

async function onManageSubscription() {
  try {
    await openBillingPortal();
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not open billing portal. Please try again.', life: 3000 });
  }
}

const showCancelDialog = ref(false);
const cancelLoading = ref(false);
const cancelledPeriodEnd = ref<string | null>(null);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function onConfirmCancel() {
  cancelLoading.value = true;
  try {
    const result = await cancelSubscription();
    showCancelDialog.value = false;
    cancelledPeriodEnd.value = result.currentPeriodEnd;
    toast.add({
      severity: 'success',
      summary: 'Subscription Cancelled',
      detail: `Your subscription has been cancelled. You will continue to have access to your current plan benefits until ${formatDate(result.currentPeriodEnd)}.`,
      life: 8000,
    });
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not cancel subscription. Please try again.', life: 3000 });
  } finally {
    cancelLoading.value = false;
  }
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
    await Promise.all([
      fetchBillingStatus().catch(() => {}),
      fetchPlans().catch(() => {}),
    ]);
    if (anyUsageAbove80.value) {
      await fetchCleanupSuggestions();
    }
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="max-w-[980px] mx-auto w-full flex flex-col px-3 md:px-0">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center gap-4 p-16 text-[var(--text-secondary)]">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <span>Loading workspace...</span>
      </div>

      <template v-else-if="currentWorkspace">
        <!-- Heading -->
        <div class="flex items-center gap-3 p-4">
          <h1 class="font-[Inter,sans-serif] font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">{{ currentWorkspace.name }}</h1>
          <span class="inline-flex items-center px-3 py-1 rounded-2xl bg-[var(--primary-color)] text-white text-xs font-semibold uppercase tracking-[0.05em]">{{ tierName }}</span>
        </div>

        <!-- Usage & Limits -->
        <div class="flex items-center justify-between p-4 gap-2">
          <h2 class="font-[Inter,sans-serif] font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Usage &amp; Limits</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 px-4 pb-4">
          <div v-for="metric in usageMetrics" :key="metric.label" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-5 flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <i :class="'pi ' + metric.icon" class="text-base text-[var(--text-secondary)]"></i>
              <span class="font-semibold text-sm text-[var(--text-color)]">{{ metric.label }}</span>
            </div>
            <div class="text-xl font-semibold text-[var(--text-color)]">
              {{ formatUsageValue(metric.current, metric.max, metric.formatter) }}
            </div>
            <ProgressBar
              v-if="metric.max !== undefined"
              :value="getPercentage(metric.current, metric.max)"
              :showValue="false"
              :severity="getProgressSeverity(metric.current, metric.max)"
              class="usage-bar"
            />
            <div v-else class="text-[13px] text-[var(--text-secondary)]">Unlimited</div>
          </div>
        </div>

        <!-- Features -->
        <div class="flex items-center justify-between p-4 gap-2">
          <h2 class="font-[Inter,sans-serif] font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Features</h2>
        </div>

        <div class="flex flex-col gap-2 px-4 pb-4">
          <div v-for="feature in features" :key="feature.feature" class="flex items-center gap-2.5 py-2.5 px-3.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-lg">
            <i
              :class="feature.enabled ? 'pi pi-check-circle text-[#27ae60] text-base' : 'pi pi-times-circle text-[var(--text-secondary)] text-base'"
            ></i>
            <span class="text-sm font-medium text-[var(--text-color)]">{{ formatFeatureName(feature.feature) }}</span>
          </div>
          <div v-if="features.length === 0" class="text-[var(--text-secondary)] text-sm py-2.5 px-3.5">
            No features configured for this tier.
          </div>
        </div>

        <!-- Cleanup Suggestions -->
        <template v-if="anyUsageAbove80 && cleanupItems.length > 0">
          <div class="flex items-center justify-between p-4 gap-2">
            <h2 class="font-[Inter,sans-serif] font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Cleanup Suggestions</h2>
          </div>
          <p class="text-[var(--text-secondary)] text-sm mx-4 mb-2 mt-0">
            These items haven't been updated recently. Review them to free up space.
          </p>

          <div class="flex flex-col gap-1 px-4 pb-4">
            <div
              v-for="(item, index) in cleanupItems"
              :key="index"
              class="flex items-center gap-3 py-3 px-3.5 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-lg cursor-pointer transition-colors duration-150 hover:bg-[var(--surface-ground)]"
              @click="navigateToItem(item)"
            >
              <i :class="item.type === 'project' ? 'pi pi-folder' : 'pi pi-file'" class="text-base text-[var(--text-secondary)]"></i>
              <div class="flex-1 flex flex-col gap-0.5 min-w-0">
                <span class="text-sm font-medium text-[var(--text-color)] whitespace-nowrap overflow-hidden text-ellipsis">{{ item.name }}</span>
                <span v-if="item.projectName" class="text-xs text-[var(--text-secondary)]">in {{ item.projectName }}</span>
              </div>
              <span class="text-xs text-[var(--text-secondary)] whitespace-nowrap">{{ formatRelativeDate(item.lastActivity) }}</span>
              <span v-if="item.fileSize" class="text-xs text-[var(--text-secondary)] whitespace-nowrap">{{ formatFileSize(item.fileSize) }}</span>
            </div>
          </div>
        </template>

        <!-- Billing -->
        <div class="flex items-center justify-between p-4 gap-2">
          <h2 class="font-[Inter,sans-serif] font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">
            {{ isSubscribed ? 'Subscription' : 'Upgrade' }}
          </h2>
        </div>

        <!-- Subscribed: manage existing subscription -->
        <div v-if="isSubscribed" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6 mx-4 mb-4">
          <h3 class="text-lg font-semibold text-[var(--text-color)] mt-0 mb-2">{{ billingStatus?.currentPlan?.name ?? 'Active' }} Plan</h3>
          <p class="text-sm text-[var(--text-secondary)] mt-0 mb-4 leading-normal">
            Your subscription is active. Manage billing, update payment methods, or change your plan.
          </p>
          <div class="flex gap-3">
            <Button
              label="Manage Subscription"
              icon="pi pi-credit-card"
              @click="onManageSubscription"
            />
            <Button
              label="Cancel Subscription"
              icon="pi pi-times"
              severity="danger"
              text
              @click="showCancelDialog = true"
            />
          </div>
        </div>

        <!-- Cancellation notice -->
        <div v-else-if="cancelledPeriodEnd || currentSubscription?.status === 'canceled'" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6 mx-4 mb-4">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-info-circle text-[var(--text-secondary)]"></i>
            <h3 class="text-lg font-semibold text-[var(--text-color)] m-0">Subscription Cancelled</h3>
          </div>
          <p class="text-sm text-[var(--text-secondary)] mt-0 mb-4 leading-normal">
            Your subscription has been cancelled. You will continue to receive your current plan benefits until
            <strong class="text-[var(--text-color)]">{{ formatDate(cancelledPeriodEnd ?? currentSubscription?.currentPeriodEnd ?? '') }}</strong>.
          </p>
          <Button
            label="Resubscribe"
            icon="pi pi-refresh"
            @click="onManageSubscription"
          />
        </div>

        <!-- Not subscribed: show next upgrade option -->
        <template v-else>
          <!-- Second-highest tier: contact sales for Enterprise -->
          <div v-if="isTopTier && !isHighestTier" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6 mx-4 mb-4">
            <div class="flex items-center gap-2.5 mb-2">
              <i class="pi pi-building text-lg text-[var(--primary-color)]"></i>
              <h3 class="text-lg font-semibold text-[var(--text-color)] m-0">Need more?</h3>
            </div>
            <p class="text-sm text-[var(--text-secondary)] mt-0 mb-4 leading-normal">
              Get unlimited storage, SSO, custom SLAs, and dedicated support with an Enterprise plan tailored to your organization.
            </p>
            <Button
              label="Contact Sales"
              icon="pi pi-envelope"
              as="a"
              href="mailto:sales@cedarstack.com"
            />
          </div>

          <!-- Highest tier: already on the top plan -->
          <div v-else-if="isHighestTier" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6 mx-4 mb-4">
            <div class="flex items-center gap-2.5">
              <i class="pi pi-check-circle text-lg text-[#27ae60]"></i>
              <h3 class="text-lg font-semibold text-[var(--text-color)] m-0">You're on our top-tier plan</h3>
            </div>
            <p class="text-sm text-[var(--text-secondary)] mt-2 mb-0 leading-normal">
              You have access to all features and the highest limits available. Contact support if you need anything.
            </p>
          </div>

          <!-- Show next upgrade plan -->
          <template v-else-if="nextUpgradePlan">
            <div class="flex justify-center px-4 pb-4">
              <SelectButton
                v-model="selectedInterval"
                :options="intervalOptions"
                optionLabel="label"
                optionValue="value"
                :allowEmpty="false"
              />
            </div>
            <div class="w-sm mx-auto px-4 pb-4">
              <div class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6 flex flex-col gap-3">
                <h3 class="text-lg font-semibold text-[var(--text-color)] m-0">{{ nextUpgradePlan.name }}</h3>
                <div class="text-2xl font-bold text-[var(--text-color)]">
                  {{ formatPrice(getPlanPrice(nextUpgradePlan, selectedInterval), nextUpgradePlan.currency) }}
                  <span class="text-sm font-normal text-[var(--text-secondary)]">{{ selectedInterval === 'YEARLY' ? '/year' : '/month' }}</span>
                </div>
                <span class="text-xs font-medium text-[#27ae60]" :class="{ 'invisible': selectedInterval !== 'YEARLY' }">
                  2 months free
                </span>
                <Button
                  label="Upgrade"
                  icon="pi pi-arrow-up"
                  :loading="checkoutLoading === nextUpgradePlan.id"
                  @click="onStartCheckout(nextUpgradePlan.id)"
                  class="mt-auto"
                />
              </div>
            </div>
          </template>

          <!-- Fallback -->
          <div v-else class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6 mx-4 mb-4">
            <h3 class="text-lg font-semibold text-[var(--text-color)] mt-0 mb-2">Need more from your workspace?</h3>
            <p class="text-sm text-[var(--text-secondary)] mt-0 mb-4 leading-normal">
              Unlock higher limits, advanced features, and priority support by upgrading your plan.
            </p>
            <Button
              label="Manage Subscription"
              icon="pi pi-credit-card"
              @click="onManageSubscription"
            />
          </div>
        </template>

        <!-- Cancel confirmation dialog -->
        <Dialog v-model:visible="showCancelDialog" header="Cancel Subscription" modal class="max-w-md">
          <div class="flex flex-col gap-4">
            <p class="text-sm text-[var(--text-secondary)] m-0 leading-normal">
              Are you sure you want to cancel your subscription? You will continue to have access to your current plan benefits until the end of your billing period
              <span v-if="currentSubscription?.currentPeriodEnd">
                (<strong>{{ formatDate(currentSubscription.currentPeriodEnd) }}</strong>)
              </span>.
            </p>
            <p class="text-sm text-[var(--text-secondary)] m-0 leading-normal">
              After that date, your workspace will be downgraded to the free tier.
            </p>
          </div>
          <template #footer>
            <Button label="Keep Subscription" text severity="secondary" @click="showCancelDialog = false" />
            <Button label="Cancel Subscription" severity="danger" :loading="cancelLoading" @click="onConfirmCancel" />
          </template>
        </Dialog>
      </template>
    </div>
  </div>
</template>

<style scoped>
.usage-bar {
  height: 8px;
  border-radius: 4px;
}
</style>
