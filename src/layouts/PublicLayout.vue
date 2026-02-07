<template>
  <div class="public-layout">
    <header class="public-header">
      <div class="header-container">
        <router-link to="/" class="header-logo">
          <Logo size="sm" />
        </router-link>
        <div class="header-actions">
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
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import Logo from '@/components/base/Logo.vue';
import Button from 'primevue/button';
const auth = useAuth();
const router = useRouter();
const isAuthenticated = computed(() => auth.isAuthenticated.value);

function login() {
  auth.login();
}
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  background-color: var(--surface-ground);
}

.public-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

.header-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}
</style>
