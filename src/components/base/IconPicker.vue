<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import { ALLOWED_ICONS, sanitizeIcon } from '@/utils/documentTypeIcons';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const popoverRef = ref();

const selectedIcon = computed(() => sanitizeIcon(props.modelValue));

function togglePopover(event: Event) {
  popoverRef.value.toggle(event);
}

function selectIcon(icon: string) {
  emit('update:modelValue', icon);
  popoverRef.value.hide();
}
</script>

<template>
  <div class="inline-flex">
    <Button
      type="button"
      text
      class="inline-flex items-center gap-2 py-2 px-3 border border-[var(--surface-border)] rounded-md bg-[var(--surface-card)] text-[var(--text-color)] cursor-pointer min-w-40 hover:border-[var(--primary-color)]"
      @click="togglePopover"
    >
      <i :class="'pi ' + selectedIcon" class="text-base"></i>
      <span class="flex-1 text-[13px] text-left text-[var(--text-secondary)]">{{ selectedIcon }}</span>
      <i class="pi pi-chevron-down text-[10px] text-[var(--text-secondary)]"></i>
    </Button>

    <Popover ref="popoverRef" class="icon-picker-popover">
      <div class="w-70 p-3">
        <div class="grid grid-cols-6 gap-1">
          <button
            v-for="icon in ALLOWED_ICONS"
            :key="icon"
            type="button"
            class="flex items-center justify-center w-10 h-10 border border-transparent rounded-md bg-transparent text-[var(--text-color)] cursor-pointer text-base transition-all duration-150 hover:bg-[var(--surface-ground)] hover:border-[var(--surface-border)]"
            :class="{ '!bg-[var(--primary-color)] !text-white !border-[var(--primary-color)]': icon === selectedIcon }"
            @click="selectIcon(icon)"
            :title="icon"
          >
            <i :class="'pi ' + icon"></i>
          </button>
        </div>
      </div>
    </Popover>
  </div>
</template>
