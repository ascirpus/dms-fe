<template>
  <div v-if="isAuthPage" class="app-layout auth-layout">
    <router-view />
  </div>

  <div v-else-if="!isAuthenticated || tenantReady" class="app-layout">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
  </div>

  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Header from "@/components/base/Header.vue";
import { useMainStore } from "@/stores/mainStore.ts";
import { useAuth } from "@/composables/useAuth.ts";

const route = useRoute();
const store = useMainStore();
const { isAuthenticated, tenantReady } = useAuth();

const authRoutes = ['login', 'password-recovery', 'complete-setup'];
const isAuthPage = computed(() => authRoutes.includes(route.name));

onMounted(() => {
  if (!store.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    store.setTheme('dark');
  } else {
    store.setTheme(store.theme);
  }
});
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--surface-ground);
}

.auth-layout {
  background-color: transparent;
}

.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>
