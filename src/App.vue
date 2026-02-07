<template>
  <router-view />
  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import { onMounted } from 'vue';

import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useMainStore } from "@/stores/mainStore.ts";

const store = useMainStore();

onMounted(() => {
  if (!store.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    store.setTheme('dark');
  } else {
    store.setTheme(store.theme);
  }
});
</script>
