<template>
  <div class="min-h-screen flex flex-col bg-[var(--surface-ground)]">
    <header class="sticky top-0 z-[100] bg-[var(--surface-card)] border-b border-solid border-[var(--surface-border)]">
      <div class="max-w-[1200px] mx-auto flex items-center justify-between py-3 px-6">
        <router-link to="/" class="flex items-center no-underline">
          <Logo size="sm" />
        </router-link>
        <div>
          <Button
            v-if="isAuthenticated"
            label="Go to Projects"
            icon="pi pi-arrow-right"
            iconPos="right"
            text
            @click="router.push({ name: 'projects' })"
          />
          <Button v-else label="Sign In" icon="pi pi-sign-in" text @click="login" />
        </div>
      </div>
    </header>
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import Logo from '@/components/base/Logo.vue';
import Footer from '@/components/base/Footer.vue';
import Button from 'primevue/button';
const auth = useAuth();
const router = useRouter();
const isAuthenticated = computed(() => auth.isAuthenticated.value);

function login() {
  auth.login();
}
</script>
