<script setup lang="ts">
import { ref } from 'vue';
import { Button, Menu } from 'primevue';

interface Props {
  currentPage: number;
  pageCount: number;
  variant?: 'top' | 'bottom';
  versioningEnabled?: boolean;
  markerEnabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'top',
  versioningEnabled: false,
  markerEnabled: false,
});

const emit = defineEmits<{
  'update:page': [page: number];
  'toggle-pan': [];
  'toggle-marker': [];
  'show-all-comments': [];
  'show-my-comments': [];
  'expand-all-comments': [];
  'collapse-all-comments': [];
  'show-version-history': [];
  'confirm-version': [];
  'show-document-info': [];
  'download': [];
  'print': [];
  'share': [];
}>();

const currentPage = ref(props.currentPage);

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    emit('update:page', currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < props.pageCount) {
    currentPage.value++;
    emit('update:page', currentPage.value);
  }
};

// Bottom toolbar dropdown menus
const commentsMenu = ref();
const versionMenu = ref();
const moreMenu = ref();

const commentsMenuItems = ref([
  { label: 'Show All Comments', icon: 'pi pi-comments', command: () => emit('show-all-comments') },
  { label: 'Show My Comments', icon: 'pi pi-user', command: () => emit('show-my-comments') },
  { separator: true },
  { label: 'Expand All Comments', icon: 'pi pi-angle-double-down', command: () => emit('expand-all-comments') },
  { label: 'Collapse All Comments', icon: 'pi pi-angle-double-up', command: () => emit('collapse-all-comments') },
]);

const versionMenuItems = ref([
  { label: 'Show Version History', icon: 'pi pi-history', command: () => emit('show-version-history') },
  { label: 'Confirm Version', icon: 'pi pi-check-circle', command: () => emit('confirm-version') },
]);

const moreMenuItems = ref([
  { label: 'Download', icon: 'pi pi-download', command: () => emit('download') },
  { label: 'Print', icon: 'pi pi-print', command: () => emit('print') },
  { label: 'Share', icon: 'pi pi-share-alt', command: () => emit('share') },
]);
</script>

<template>
  <!-- Top variant: page navigation only -->
  <div v-if="variant === 'top'" class="flex items-center px-3 py-2 bg-[var(--surface-card)] border-[var(--surface-border)] justify-center border-b border-solid border-b-[var(--surface-border)]">
    <div class="flex items-center gap-2">
      <Button
        icon="pi pi-angle-left"
        text
        rounded
        size="small"
        @click="previousPage"
        :disabled="currentPage <= 1"
      />
      <span class="text-[13px] text-[var(--text-secondary)] min-w-[100px] text-center">Page {{ currentPage }} of {{ pageCount }}</span>
      <Button
        icon="pi pi-angle-right"
        text
        rounded
        size="small"
        @click="nextPage"
        :disabled="currentPage >= pageCount"
      />
    </div>
  </div>

  <!-- Bottom variant: full toolbar -->
  <div v-else class="flex items-center px-3 py-2 bg-[var(--surface-card)] border-[var(--surface-border)] justify-center border-t border-solid border-t-[var(--surface-border)]">
    <div class="flex items-center gap-1">
      <Button
        icon="pi pi-arrows-alt"
        text
        rounded
        size="small"
        aria-label="Pan mode"
        @click="emit('toggle-pan')"
      />

      <Button
        v-tooltip.top="'Comment mode (C)'"
        icon="pi pi-comment"
        text
        rounded
        size="small"
        :class="{ 'marker-active-btn': markerEnabled }"
        aria-label="Add marker"
        @click="emit('toggle-marker')"
      />

      <Button
        label="Comments"
        icon="pi pi-chevron-down"
        iconPos="right"
        text
        size="small"
        @click="(e: Event) => commentsMenu.toggle(e)"
      />
      <Menu ref="commentsMenu" :model="commentsMenuItems" :popup="true" />

      <template v-if="versioningEnabled">
        <Button
          label="Version"
          icon="pi pi-chevron-down"
          iconPos="right"
          text
          size="small"
          @click="(e: Event) => versionMenu.toggle(e)"
        />
        <Menu ref="versionMenu" :model="versionMenuItems" :popup="true" />
      </template>

      <Button
        icon="pi pi-info-circle"
        text
        rounded
        size="small"
        aria-label="Document info"
        @click="emit('show-document-info')"
      />

      <Button
        icon="pi pi-ellipsis-v"
        text
        rounded
        size="small"
        aria-label="More options"
        @click="(e: Event) => moreMenu.toggle(e)"
      />
      <Menu ref="moreMenu" :model="moreMenuItems" :popup="true" />
    </div>
  </div>
</template>

<style scoped>
.marker-active-btn {
  color: var(--primary-color) !important;
  background-color: color-mix(in srgb, var(--primary-color) 10%, transparent) !important;
}
</style>
