<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import Logo from './Logo.vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Menu from 'primevue/menu';

const router = useRouter();
const auth = useAuth();

const user = computed(() => auth.getCurrentUser());
const pictureUrl = computed(() => user.value?.picture || '');
const initials = computed(() => auth.getInitials());
const isAuthenticated = computed(() => auth.isAuthenticated.value);

const userMenu = ref();
const userMenuItems = computed(() => {
  if (isAuthenticated.value) {
    return [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => router.push({ name: 'profile' })
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => router.push({ name: 'settings' })
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
  // Navigate to admin/IAM section
  router.push({ name: 'admin' });
};

const goToNotifications = () => {
  router.push({ name: 'notifications' });
};
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="header-logo">
        <Logo size="sm" />
      </router-link>

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
        <Button
          icon="pi pi-bell"
          text
          rounded
          class="notification-btn"
          aria-label="Notifications"
          @click="goToNotifications"
        />

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

.header-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
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

.notification-btn {
  color: var(--text-secondary);
}

.notification-btn:hover {
  color: var(--text-color);
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
</style>
