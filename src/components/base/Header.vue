<script setup lang="ts">
import { Button, OverlayBadge, Avatar, Menu } from 'primevue';
import { ref } from "vue";
import logoImage from "@/assets/images/logo.svg";
import { useToast } from "primevue/usetoast";
import { useMainStore } from "@/stores/mainStore.ts";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth.ts";

const router = useRouter();

const toast = useToast();
const logoUrl = ref(logoImage);
// const avatarUrl = "https://www.gravatar.com/avatar/05dfd4b41340d09cae045235eb0893c3?d=mp";
const store = useMainStore();

const auth = useAuth();
const avatarUrl = auth.getCurrentUser().avatar;

const theme = store.theme;

// User menu items
const userMenu = ref(null);
const userMenuItems = ref({});

if (auth.isAuthenticated.value) {
  userMenuItems.value = [
      {
        label: 'User Options',
        items: [
          {
            label: 'Profile',
            icon: 'pi pi-user',
            command: () => navigateTo('profile')
          },
          {
            label: 'Projects',
            icon: 'pi pi-folder',
            command: () => navigateTo('projects')
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => navigateTo('settings')
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => {
          signOut();
          useAuth().logout();
        }
      }
    ]
} else {
  userMenuItems.value = [
      {
        label: 'Sign in',
        icon: 'pi pi-sign-in',
        command: () => {

          auth.login();
        }
      }
  ]
}

// Menu toggle function
const toggleUserMenu = (event) => {
  userMenu.value.toggle(event);
};

// Navigation functions
const navigateTo = (route) => {
  router.push({ name: 'profile' });
  toast.add({ severity: 'info', summary: 'Navigation', detail: `Navigating to ${route}`, life: 3000 });
  // In a real app, you would use router.push(route)
};

const signOut = () => {
  toast.add({ severity: 'info', summary: 'Authentication', detail: 'Signing out...', life: 3000 });
  // In a real app, you would handle the sign-out process
};

const switchTheme = (newTheme: 'light' | 'dark') => {
  store.setTheme(newTheme);
};

const label = avatarUrl != '' ? undefined : auth.getInitials()
</script>

<template>
  <div class="app-header">
    <div class="header-logo">
      <img :src="logoUrl" alt="DMS Logo" class="logo-image" />
      <span class="logo-text">DocManager</span>
    </div>

    <div class="header-actions">
      <Button label="Light" icon="pi pi-sun" @click="switchTheme('light')"
              class="p-button-text p-button-rounded mr-2"
              :class="{ 'p-button-plain': theme !== 'light' }" />
      <Button label="Dark" icon="pi pi-moon" @click="switchTheme('dark')"
              class="p-button-text p-button-rounded mr-3"
              :class="{ 'p-button-plain': theme !== 'dark' }" />

      <div class="user-profile">
        <OverlayBadge value="4" severity="danger" class="inline-flex">
          <Avatar
              :label="label"
              :image="avatarUrl"
              @click="toggleUserMenu"
              size="large"
              shape="circle"
              :class="label ? 'user-avatar bg-(--primary-color) text-white' : 'user-avatar' "
          />
        </OverlayBadge>

        <Menu ref="userMenu"
              :model="userMenuItems"
              :popup="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>