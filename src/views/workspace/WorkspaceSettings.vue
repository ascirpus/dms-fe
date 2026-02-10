<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useWorkspace } from '@/composables/useWorkspace';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { currentWorkspaceName } = useWorkspace();

const navItems = computed(() => [
  { label: t('workspaceSettings.documentTypes'), icon: 'pi pi-file', route: 'workspace-document-types' },
  { label: t('workspaceSettings.members'), icon: 'pi pi-users', route: 'workspace-members' },
]);

function isActive(routeName: string) {
  return route.name === routeName;
}

function navigateTo(routeName: string) {
  router.push({ name: routeName });
}
</script>

<template>
  <div class="flex flex-col h-full p-0">
    <div class="max-w-[1200px] mx-auto w-full flex flex-col md:px-0 px-3">
      <div class="p-4">
        <h1 class="font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">{{ $t('workspaceSettings.title', { workspace: currentWorkspaceName || t('workspaceSwitcher.workspace') }) }}</h1>
      </div>

      <div class="flex flex-col md:flex-row gap-6 p-4 pt-0">
        <!-- Sidebar Navigation -->
        <nav class="flex flex-row md:flex-col gap-1 md:w-[220px] shrink-0">
          <button
            v-for="item in navItems"
            :key="item.route"
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left border-0 cursor-pointer"
            :class="isActive(item.route)
              ? 'bg-[var(--primary-color)] text-white'
              : 'bg-transparent text-[var(--text-color)] hover:bg-[var(--surface-ground)]'"
            @click="navigateTo(item.route)"
          >
            <i :class="item.icon" class="text-sm"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- Content Area -->
        <div class="flex-1 min-w-0 md:border-l md:border-[var(--surface-border)] md:pl-6">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
