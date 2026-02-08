<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[var(--surface-ground)]">
    <Header />
    <main class="flex-1 min-h-0 flex flex-col overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/base/Header.vue';
</script>
