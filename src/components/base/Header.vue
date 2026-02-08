<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { useSearch } from '@/composables/useSearch';
import { useProjects } from '@/composables/useProjects';
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

const router = useRouter();
const route = useRoute();
const auth = useAuth();
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
    return `Search in ${currentProjectName.value}...`;
  }
  return 'Search documents...';
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
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => router.push({ name: 'profile' })
      },
      { separator: true },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => auth.logout()
      }
    ];
  }
  return [
    {
      label: 'Sign In',
      icon: 'pi pi-sign-in',
      command: () => router.push({ name: 'login' })
    }
  ];
});

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event);
};

const goToAdmin = () => {
  router.push({ name: 'admin' });
};

const goToNotifications = () => {
  router.push({ name: 'notifications' });
};
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo + Workspace Switcher -->
      <div class="header-left">
        <router-link to="/app" class="header-logo">
          <Logo size="sm" />
        </router-link>
        <span v-if="isAuthenticated" class="header-separator">/</span>
        <WorkspaceSwitcher v-if="isAuthenticated" />
      </div>

      <!-- Search Bar (only when authenticated) -->
      <div v-if="isAuthenticated" ref="searchContainer" class="header-search">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            size="small"
            class="search-input"
            @focus="onSearchFocus"
            @blur="onSearchBlur"
            @keydown="onSearchKeydown"
          />
        </IconField>

        <!-- Quick Results Dropdown -->
        <div v-if="showDropdown" class="search-dropdown">
          <div v-if="searchLoading" class="search-dropdown-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Searching...</span>
          </div>
          <template v-else>
            <div
              v-for="result in searchResults.slice(0, 5)"
              :key="result.documentId"
              class="search-dropdown-item"
              tabindex="0"
              @mousedown.prevent="navigateToDocument(result)"
            >
              <div class="search-item-title">
                <i class="pi pi-file"></i>
                <span>{{ result.title }}</span>
              </div>
              <div v-if="result.snippet" class="search-item-snippet" v-html="result.snippet"></div>
            </div>
            <div
              class="search-dropdown-footer"
              tabindex="0"
              @mousedown.prevent="navigateToSearchResults"
            >
              View all results
            </div>
          </template>
        </div>
      </div>

      <!-- Right side actions -->
      <div class="header-actions">
        <!-- Admin link (IAM) - only show for admins -->
        <Button
          label="IAM"
          icon="pi pi-user"
          text
          class="admin-link"
          @click="goToAdmin"
        />

        <!-- Notifications -->
        <div class="notification-wrapper">
          <Button
            icon="pi pi-bell"
            text
            rounded
            class="notification-btn"
            aria-label="Notifications"
            @click="goToNotifications"
          />
          <Badge
            v-if="unreadCount > 0"
            :value="unreadCount > 99 ? '99+' : unreadCount.toString()"
            severity="danger"
            class="notification-badge"
          />
        </div>

        <!-- User Avatar -->
        <div class="user-avatar-wrapper">
          <Avatar
            v-if="pictureUrl"
            :image="pictureUrl"
            shape="circle"
            size="normal"
            class="user-avatar"
            @click="toggleUserMenu"
          />
          <Avatar
            v-else
            :label="initials || '?'"
            shape="circle"
            size="normal"
            class="user-avatar user-avatar-initials"
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
.app-header {
  background-color: var(--surface-card);
  padding: 12px 16px;
  width: 100%;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 12px 16px;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  background-color: var(--surface-card);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.header-separator {
  color: var(--text-secondary);
  font-size: 20px;
  font-weight: 300;
  user-select: none;
  opacity: 0.6;
}

.header-search {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.search-input {
  width: 100%;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
}

.search-dropdown-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.search-dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.search-dropdown-item:hover {
  background-color: var(--surface-ground);
}

.search-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.search-item-title i {
  font-size: 12px;
  color: var(--text-secondary);
}

.search-item-snippet {
  margin-top: 2px;
  margin-left: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-item-snippet :deep(em) {
  font-style: normal;
  font-weight: 600;
  color: var(--text-color);
}

.search-dropdown-footer {
  padding: 10px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  border-top: 1px solid var(--surface-border);
  transition: background-color 0.15s;
}

.search-dropdown-footer:hover {
  background-color: var(--surface-ground);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-link {
  color: var(--text-secondary);
  font-weight: 500;
}

.admin-link:hover {
  color: var(--text-color);
}

.notification-wrapper {
  position: relative;
  display: inline-flex;
}

.notification-btn {
  color: var(--text-secondary);
}

.notification-btn:hover {
  color: var(--text-color);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
  min-width: 1.25rem;
  height: 1.25rem;
  font-size: 0.75rem;
}

.user-avatar-wrapper {
  cursor: pointer;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar-initials {
  background-color: var(--primary-color);
  color: white;
}

@media (max-width: 640px) {
  .header-search {
    display: none;
  }
}
</style>
