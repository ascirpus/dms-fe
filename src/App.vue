<template>
  <div v-if="isAuthPage" class="app-layout auth-layout">
    <router-view />
  </div>

  <div v-else class="app-layout">
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

const route = useRoute();
const store = useMainStore();

// Auth pages that don't need header
const authRoutes = ['login', 'password-recovery', 'complete-setup'];
const isAuthPage = computed(() => authRoutes.includes(route.name));

onMounted(() => {
  // Check for saved theme preference or system preference
  if (!store.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    store.setTheme('dark');
  } else {
    store.setTheme(store.theme);
  }
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-ground);
}

.auth-layout {
  background-color: transparent;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
