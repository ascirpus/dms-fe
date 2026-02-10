<template>
  <div class="min-h-screen flex flex-col bg-[var(--surface-ground)]">
    <header class="sticky top-0 z-[100] bg-[var(--surface-card)] border-b border-solid border-[var(--surface-border)]">
      <div class="max-w-[1200px] mx-auto flex items-center justify-between py-3 px-6">
        <router-link to="/" class="flex items-center no-underline">
          <Logo size="sm" />
        </router-link>
        <div class="flex items-center gap-2">
          <Button
            :icon="themeIcon"
            text
            rounded
            class="!text-[var(--text-secondary)] hover:!text-[var(--text-color)]"
            :aria-label="t('publicLayout.toggleTheme')"
            @click="toggleTheme"
          />
          <Button
            v-if="isAuthenticated"
            :label="t('publicLayout.goToProjects')"
            icon="pi pi-arrow-right"
            iconPos="right"
            text
            @click="router.push({ name: 'projects' })"
          />
          <Button v-else :label="t('publicLayout.signIn')" icon="pi pi-sign-in" text @click="login" />
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
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';
import { useMainStore } from '@/stores/mainStore';
import Logo from '@/components/base/Logo.vue';
import Footer from '@/components/base/Footer.vue';
import Button from 'primevue/button';
const { t } = useI18n();
const auth = useAuth();
const router = useRouter();
const store = useMainStore();
const isAuthenticated = computed(() => auth.isAuthenticated.value);

const currentResolvedTheme = computed(() => {
  if (store.theme === 'auto') {
    const hour = new Date().getHours();
    return (hour >= 20 || hour < 7) ? 'dark' : 'light';
  }
  return store.theme;
});
const themeIcon = computed(() => currentResolvedTheme.value === 'dark' ? 'pi pi-sun' : 'pi pi-moon');

function toggleTheme() {
  const newTheme = currentResolvedTheme.value === 'dark' ? 'light' : 'dark';
  store.setTheme(newTheme);
  if (isAuthenticated.value) {
    auth.updateProfile({ themePreference: newTheme });
  }
}

function login() {
  auth.login();
}
</script>
