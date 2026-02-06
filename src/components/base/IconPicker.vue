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
  <div class="icon-picker">
    <Button
      type="button"
      text
      class="icon-picker-trigger"
      @click="togglePopover"
    >
      <i :class="'pi ' + selectedIcon" class="trigger-icon"></i>
      <span class="trigger-label">{{ selectedIcon }}</span>
      <i class="pi pi-chevron-down trigger-chevron"></i>
    </Button>

    <Popover ref="popoverRef" class="icon-picker-popover">
      <div class="icon-picker-panel">
        <div class="icon-grid">
          <button
            v-for="icon in ALLOWED_ICONS"
            :key="icon"
            type="button"
            class="icon-option"
            :class="{ selected: icon === selectedIcon }"
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

<style scoped>
.icon-picker {
  display: inline-flex;
}

.icon-picker-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  background: var(--surface-card);
  color: var(--text-color);
  cursor: pointer;
  min-width: 160px;
}

.icon-picker-trigger:hover {
  border-color: var(--primary-color);
}

.trigger-icon {
  font-size: 16px;
}

.trigger-label {
  flex: 1;
  font-size: 13px;
  text-align: left;
  color: var(--text-secondary);
}

.trigger-chevron {
  font-size: 10px;
  color: var(--text-secondary);
}

.icon-picker-panel {
  width: 280px;
  padding: 12px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.15s;
}

.icon-option:hover {
  background: var(--surface-ground);
  border-color: var(--surface-border);
}

.icon-option.selected {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
</style>
