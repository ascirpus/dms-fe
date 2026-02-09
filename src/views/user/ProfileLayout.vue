<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { getDisplayName } from '@/utils/avatar';

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const fullName = computed(() => {
  const user = auth.getCurrentUser();
  return getDisplayName(user ?? { email: '' });
});

const navItems = [
  { label: 'General', icon: 'pi pi-user', route: 'profile-general' },
  { label: 'Notifications', icon: 'pi pi-bell', route: 'profile-notifications' },
  { label: 'Appearance', icon: 'pi pi-palette', route: 'profile-appearance' },
];

function isActive(routeName: string) {
  return route.name === routeName;
}

function navigateTo(routeName: string) {
  router.push({ name: routeName });
}

onMounted(async () => {
  if (!auth.currentUser.value) {
    await auth.fetchCurrentUser();
  }
});
</script>

<template>
  <div class="flex flex-col h-full p-0">
    <div class="max-w-[980px] mx-auto w-full flex flex-col md:px-0 px-3">
      <div class="p-4">
        <h1 class="font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">{{ fullName }}</h1>
      </div>

      <div class="flex flex-col md:flex-row gap-6 p-4 pt-0">
        <!-- Sidebar Navigation -->
        <nav class="flex flex-row md:flex-col gap-1 md:w-[220px] shrink-0">
          <button
            v-for="item in navItems"
            :key="item.route"
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left border-0 cursor-pointer"
            :class="isActive(item.route)
              ? 'bg-[var(--primary-color)] text-white'
              : 'bg-transparent text-[var(--text-color)] hover:bg-[var(--surface-ground)]'"
            @click="navigateTo(item.route)"
          >
            <i :class="item.icon" class="text-sm"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- Content Area -->
        <div class="flex-1 min-w-0">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
