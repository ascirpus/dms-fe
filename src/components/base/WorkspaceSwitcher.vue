<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkspace } from '@/composables/useWorkspace';
import { useAuth } from '@/composables/useAuth';
import { useToast } from 'primevue/usetoast';
import Popover from 'primevue/popover';

const router = useRouter();
const toast = useToast();
const { getCurrentTenantId } = useAuth();
const {
  currentWorkspaceName,
  userWorkspaces,
  workspacesLoaded,
  fetchWorkspaces,
  switchWorkspace,
} = useWorkspace();

const popover = ref();

const currentTenantId = computed(() => getCurrentTenantId());

const otherWorkspaces = computed(() =>
  userWorkspaces.value.filter(w => w.tenantId !== currentTenantId.value)
);

function toggle(event: Event) {
  popover.value?.toggle(event);
}

async function onSwitchWorkspace(tenantId: string) {
  popover.value?.hide();
  await switchWorkspace(tenantId);
}

function navigateTo(routeName: string) {
  popover.value?.hide();
  router.push({ name: routeName });
}

function onAddWorkspace() {
  popover.value?.hide();
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Creating additional workspaces will be available soon. Upgrade your plan to unlock this feature.',
    life: 5000,
  });
}

onMounted(() => {
  if (!workspacesLoaded.value) {
    fetchWorkspaces();
  }
});
</script>

<template>
  <button class="workspace-trigger" @click="toggle">
    <span class="workspace-name">{{ currentWorkspaceName || 'Workspace' }}</span>
    <i class="pi pi-chevron-down chevron-icon"></i>
  </button>

  <Popover ref="popover" class="workspace-popover">
    <div class="workspace-menu">
      <!-- Current workspace -->
      <div class="workspace-item workspace-item-current">
        <i class="pi pi-check check-icon"></i>
        <span class="workspace-item-name">{{ currentWorkspaceName }}</span>
      </div>

      <!-- Other workspaces -->
      <div
        v-for="ws in otherWorkspaces"
        :key="ws.tenantId"
        class="workspace-item workspace-item-switchable"
        @click="onSwitchWorkspace(ws.tenantId)"
      >
        <span class="workspace-item-name">{{ ws.name }}</span>
      </div>

      <!-- Add workspace -->
      <div class="workspace-item workspace-item-add" @click="onAddWorkspace">
        <i class="pi pi-plus add-icon"></i>
        <span>New Workspace</span>
      </div>

      <div class="workspace-divider"></div>

      <!-- Navigation links -->
      <div class="workspace-item workspace-item-link" @click="navigateTo('workspace-settings')">
        <i class="pi pi-cog"></i>
        <span>Workspace Settings</span>
      </div>
      <div class="workspace-item workspace-item-link" @click="navigateTo('workspace-overview')">
        <i class="pi pi-chart-bar"></i>
        <span>Usage &amp; Limits</span>
      </div>
    </div>
  </Popover>
</template>

<style scoped>
.workspace-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  color: var(--text-secondary);
}

.workspace-trigger:hover {
  background-color: var(--surface-ground);
  border-color: var(--surface-border);
  color: var(--text-color);
}

.workspace-name {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  font-size: 9px;
  color: var(--text-secondary);
  transition: color 0.15s;
}

.workspace-trigger:hover .chevron-icon {
  color: var(--text-color);
}

.workspace-menu {
  min-width: 220px;
}

.workspace-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-color);
  cursor: default;
}

.workspace-item-current {
  background-color: var(--surface-ground);
  border-radius: 6px;
}

.check-icon {
  font-size: 12px;
  color: var(--primary-color);
}

.workspace-item-switchable {
  cursor: pointer;
  border-radius: 6px;
  padding-left: 36px;
  transition: background-color 0.15s;
}

.workspace-item-switchable:hover {
  background-color: var(--surface-ground);
}

.workspace-item-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-item-add {
  cursor: pointer;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: background-color 0.15s, color 0.15s;
}

.workspace-item-add:hover {
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.add-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
}

.workspace-divider {
  height: 1px;
  background-color: var(--surface-border);
  margin: 6px 0;
}

.workspace-item-link {
  cursor: pointer;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: background-color 0.15s, color 0.15s;
}

.workspace-item-link:hover {
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.workspace-item-link i {
  font-size: 14px;
}
</style>
