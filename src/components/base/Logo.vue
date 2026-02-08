<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}>();

const resolvedSize = computed(() => props.size ?? 'md');

const iconWidthClass = computed(() => {
  switch (resolvedSize.value) {
    case 'sm': return 'w-8';
    case 'md': return 'w-[42px]';
    case 'lg': return 'w-[53px]';
  }
});

const textWidthClass = computed(() => {
  switch (resolvedSize.value) {
    case 'sm': return 'w-[60px]';
    case 'md': return 'w-20';
    case 'lg': return 'w-[102px]';
  }
});
</script>

<template>
  <div class="flex items-end gap-2">
    <img src="/images/logo.svg" alt="CedarStack Logo" class="block h-auto" :class="iconWidthClass" />
    <img src="/images/logo-text.svg" alt="CedarStack" class="block h-auto" :class="textWidthClass" />
    <div v-if="showTagline" class="font-['Inter',sans-serif] font-medium text-sm leading-[1.4] text-slate-800 flex flex-col ml-2">
      <span>Intelligent</span>
      <span>Document Hub</span>
    </div>
  </div>
</template>
