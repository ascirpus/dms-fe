<template>
  <router-view />
  <Toast />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';

import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useMainStore } from "@/stores/mainStore.ts";
import { useAuth } from "@/composables/useAuth.ts";

const store = useMainStore();
const auth = useAuth();

onMounted(() => {
  store.setTheme(store.theme || 'auto');
});

watch(auth.currentUser, (user) => {
  if (user?.themePreference) {
    store.setTheme(user.themePreference);
  }
});
</script>
