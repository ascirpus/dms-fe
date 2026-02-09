<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[var(--surface-ground)]">
    <Header />
    <PendingInvitesBanner />
    <main class="flex-1 min-h-0 flex flex-col overflow-y-auto p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/base/Header.vue';
import PendingInvitesBanner from '@/components/base/PendingInvitesBanner.vue';
</script>
