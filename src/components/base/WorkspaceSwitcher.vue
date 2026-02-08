<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkspace } from '@/composables/useWorkspace';
import { useAuth } from '@/composables/useAuth';
import Popover from 'primevue/popover';

const router = useRouter();
const { getCurrentTenantId } = useAuth();
const {
  currentWorkspace,
  currentWorkspaceName,
  userWorkspaces,
  workspacesLoaded,
  canCreateWorkspace,
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
  if (canCreateWorkspace.value) {
    router.push({ name: 'create-workspace' });
  } else {
    router.push({ name: 'workspace-overview' });
  }
}

onMounted(() => {
  if (!workspacesLoaded.value) {
    fetchWorkspaces();
  }
});
</script>

<template>
  <button
    class="group flex items-center gap-1.5 py-1 px-2.5 border border-transparent rounded-md bg-transparent cursor-pointer transition-colors text-[var(--text-secondary)] hover:bg-[var(--surface-ground)] hover:border-[var(--surface-border)] hover:text-[var(--text-color)]"
    @click="toggle"
  >
    <span class="font-['Inter',sans-serif] font-medium text-[13px] leading-5 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">{{ currentWorkspaceName || 'Workspace' }}</span>
    <i class="pi pi-chevron-down text-[9px] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-color)]"></i>
  </button>

  <Popover ref="popover" class="workspace-popover">
    <div class="min-w-[220px]">
      <!-- Current workspace -->
      <div class="flex items-center gap-2.5 py-2.5 px-3.5 text-sm text-[var(--text-color)] cursor-default bg-[var(--surface-hover)] rounded-md">
        <i class="pi pi-check text-xs text-[var(--primary-color)]"></i>
        <span class="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ currentWorkspaceName }}</span>
      </div>

      <!-- Other workspaces -->
      <div
        v-for="ws in otherWorkspaces"
        :key="ws.tenantId"
        class="flex items-center gap-2.5 py-2.5 px-3.5 text-sm text-[var(--text-color)] cursor-pointer rounded-md pl-9 transition-colors hover:bg-[var(--surface-hover)]"
        @click="onSwitchWorkspace(ws.tenantId)"
      >
        <span class="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ ws.name }}</span>
      </div>

      <!-- Add workspace -->
      <div
        class="flex items-center gap-2.5 py-2.5 px-3.5 text-sm text-[var(--text-secondary)] cursor-pointer rounded-md transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-color)]"
        @click="onAddWorkspace"
      >
        <i class="pi pi-plus text-xs w-4 text-center"></i>
        <span>New Workspace</span>
      </div>

      <div class="h-px bg-[var(--surface-border)] my-1.5"></div>

      <!-- Navigation links -->
      <div
        class="flex items-center gap-2.5 py-2.5 px-3.5 text-sm text-[var(--text-secondary)] cursor-pointer rounded-md transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-color)]"
        @click="navigateTo('workspace-settings')"
      >
        <i class="pi pi-cog text-sm"></i>
        <span>Workspace Settings</span>
      </div>
      <div
        class="flex items-center gap-2.5 py-2.5 px-3.5 text-sm text-[var(--text-secondary)] cursor-pointer rounded-md transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-color)]"
        @click="navigateTo('workspace-overview')"
      >
        <i class="pi pi-chart-bar text-sm"></i>
        <span>Usage &amp; Limits</span>
      </div>
    </div>
  </Popover>
</template>
