<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[var(--surface-ground)]">
    <Header />
    <PendingInvitesBanner />
    <main class="flex-1 min-h-0 flex flex-col overflow-y-auto p-4">
      <router-view :key="tenantId" />
    </main>
    <Footer />
    <WorkspaceTransitionOverlay />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Header from '@/components/base/Header.vue';
import Footer from '@/components/base/Footer.vue';
import PendingInvitesBanner from '@/components/base/PendingInvitesBanner.vue';
import WorkspaceTransitionOverlay from '@/components/base/WorkspaceTransitionOverlay.vue';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const tenantId = computed(() => authStore.tenantId ?? 'default');
</script>
