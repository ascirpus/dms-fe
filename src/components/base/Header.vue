<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { useSearch } from '@/composables/useSearch';
import { useProjects } from '@/composables/useProjects';
import { useMainStore } from '@/stores/mainStore';
import { getInitialsFromUser } from '@/utils/avatar';
import Logo from './Logo.vue';
import WorkspaceSwitcher from './WorkspaceSwitcher.vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Menu from 'primevue/menu';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuth();
const store = useMainStore();
const { unreadCount, fetchUnreadCount } = useNotifications();
const { resolveProject } = useProjects();

const user = computed(() => auth.getCurrentUser());
const pictureUrl = computed(() => user.value?.picture || '');
const initials = computed(() => user.value ? getInitialsFromUser(user.value) : '?');
const isAuthenticated = computed(() => auth.isAuthenticated.value);

// Project-scoped search
const currentProjectSlug = computed(() => {
  if (route.matched.some(r => r.path.startsWith('/projects'))) {
    return route.params.id as string | undefined;
  }
  return undefined;
});

const currentProjectId = computed(() => {
  if (!currentProjectSlug.value) return undefined;
  return resolveProject(currentProjectSlug.value)?.project.id;
});

const currentProjectName = computed(() => {
  if (!currentProjectSlug.value) return undefined;
  return resolveProject(currentProjectSlug.value)?.project.name;
});

const projectIdRef = computed(() => currentProjectId.value);
const { query: searchQuery, results: searchResults, loading: searchLoading, clear: clearSearch } = useSearch(projectIdRef);

const searchPlaceholder = computed(() => {
  if (currentProjectName.value) {
    return t('header.searchInProject', { project: currentProjectName.value });
  }
  return t('common.searchDocuments');
});

// Dropdown visibility
const dropdownVisible = ref(false);
const searchInputFocused = ref(false);
const searchContainer = ref<HTMLElement | null>(null);

const showDropdown = computed(() => {
  return searchInputFocused.value && searchQuery.value.trim().length >= 2 && (searchResults.value.length > 0 || searchLoading.value);
});

function onSearchFocus() {
  searchInputFocused.value = true;
}

function onSearchBlur(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (searchContainer.value?.contains(relatedTarget)) {
    return;
  }
  searchInputFocused.value = false;
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    searchInputFocused.value = false;
    (event.target as HTMLElement)?.blur();
  } else if (event.key === 'Enter') {
    navigateToSearchResults();
  }
}

function navigateToSearchResults() {
  const q = searchQuery.value.trim();
  if (!q) return;

  const query: Record<string, string> = { q };
  if (currentProjectId.value) {
    query.projectId = currentProjectId.value;
  }
  router.push({ name: 'search', query });
  searchInputFocused.value = false;
}

function navigateToDocument(result: { projectId: string; documentId: string }) {
  clearSearch();
  searchInputFocused.value = false;
  router.push({
    name: 'project-document',
    params: { id: result.projectId, documentId: result.documentId },
  });
}

// Close dropdown on route change
watch(() => route.path, () => {
  searchInputFocused.value = false;
});

// Fetch unread count on mount if authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    fetchUnreadCount();
  }
});

const userMenu = ref();
const userMenuItems = computed(() => {
  if (isAuthenticated.value) {
    return [
      {
        label: t('common.profile'),
        icon: 'pi pi-user',
        command: () => router.push({ name: 'profile-general' })
      },
      { separator: true },
      {
        label: t('common.signOut'),
        icon: 'pi pi-sign-out',
        command: () => auth.logout()
      }
    ];
  }
  return [
    {
      label: t('common.signIn'),
      icon: 'pi pi-sign-in',
      command: () => router.push({ name: 'login' })
    }
  ];
});

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event);
};

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
  auth.updateProfile({ themePreference: newTheme });
}

const goToAdmin = () => {
  router.push({ name: 'admin' });
};

const goToNotifications = () => {
  router.push({ name: 'notifications' });
};
</script>

<template>
  <header class="bg-[var(--surface-card)] py-3 px-4 w-full">
    <div class="flex items-center justify-between gap-8 py-3 px-4 border border-[var(--surface-border)] rounded-[10px] bg-[var(--surface-card)] max-w-7xl mx-auto">
      <!-- Logo + Workspace Switcher -->
      <div class="flex items-center gap-1.5">
        <router-link to="/app" class="flex items-center no-underline">
          <Logo size="sm" />
        </router-link>
        <span v-if="isAuthenticated" class="text-[var(--text-secondary)] text-xl font-light select-none opacity-60">/</span>
        <WorkspaceSwitcher v-if="isAuthenticated" />
      </div>

      <!-- Search Bar (only when authenticated) -->
      <div v-if="isAuthenticated" ref="searchContainer" class="relative flex-1 max-w-[480px] max-sm:hidden">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            size="small"
            class="w-full"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
            @keydown="onSearchKeydown"
          />
        </IconField>

        <!-- Quick Results Dropdown -->
        <div v-if="showDropdown" class="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-[1000] overflow-hidden">
          <div v-if="searchLoading" class="flex items-center gap-2 py-3 px-4 text-[var(--text-secondary)] text-[13px]">
            <i class="pi pi-spin pi-spinner"></i>
            <span>{{ $t('common.searching') }}</span>
          </div>
          <template v-else>
            <div
              v-for="result in searchResults.slice(0, 5)"
              :key="result.documentId"
              class="py-2.5 px-4 cursor-pointer transition-colors hover:bg-[var(--surface-ground)]"
              tabindex="0"
              @mousedown.prevent="navigateToDocument(result)"
            >
              <div class="flex items-center gap-2 text-sm font-medium text-[var(--text-color)]">
                <i class="pi pi-file text-xs text-[var(--text-secondary)]"></i>
                <span>{{ result.title }}</span>
              </div>
              <div v-if="result.snippet" class="search-item-snippet mt-0.5 ml-5 text-xs text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis" v-html="result.snippet"></div>
            </div>
            <div
              class="py-2.5 px-4 text-center text-[13px] font-medium text-[var(--primary-color)] cursor-pointer border-t border-[var(--surface-border)] transition-colors hover:bg-[var(--surface-ground)]"
              tabindex="0"
              @mousedown.prevent="navigateToSearchResults"
            >
              {{ $t('common.viewAllResults') }}
            </div>
          </template>
        </div>
      </div>

      <!-- Right side actions -->
      <div class="flex items-center gap-4">
        <!-- Admin link (IAM) - only show for admins -->
        <Button
          :label="t('header.iam')"
          icon="pi pi-user"
          text
          class="!text-[var(--text-secondary)] font-medium hover:!text-[var(--text-color)]"
          @click="goToAdmin"
        />

        <!-- Notifications -->
        <div class="relative inline-flex">
          <Button
            icon="pi pi-bell"
            text
            rounded
            class="!text-[var(--text-secondary)] hover:!text-[var(--text-color)]"
            :aria-label="$t('common.notifications')"
            @click="goToNotifications"
          />
          <Badge
            v-if="unreadCount > 0"
            :value="unreadCount > 99 ? '99+' : unreadCount.toString()"
            severity="danger"
            class="!absolute !top-0 !right-0 translate-x-1/4 -translate-y-1/4 !min-w-5 !h-5 !text-xs"
          />
        </div>

        <!-- Theme Toggle -->
        <Button
          :icon="themeIcon"
          text
          rounded
          class="!text-[var(--text-secondary)] hover:!text-[var(--text-color)]"
          :aria-label="$t('header.toggleTheme')"
          @click="toggleTheme"
        />

        <!-- User Avatar -->
        <div class="cursor-pointer">
          <Avatar
            v-if="pictureUrl"
            :image="pictureUrl"
            shape="circle"
            size="normal"
            class="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
            @click="toggleUserMenu"
          />
          <Avatar
            v-else
            :label="initials || '?'"
            shape="circle"
            size="normal"
            class="cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105 !bg-[var(--primary-color)] !text-white"
            @click="toggleUserMenu"
          />
          <Menu
            ref="userMenu"
            :model="userMenuItems"
            :popup="true"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.search-item-snippet :deep(em) {
  font-style: normal;
  font-weight: 600;
  color: var(--text-color);
}
</style>
