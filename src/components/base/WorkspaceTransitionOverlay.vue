<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useWorkspace } from '@/composables/useWorkspace';
import ProgressSpinner from 'primevue/progressspinner';

const { t } = useI18n();
const { isSwitching, switchingToName } = useWorkspace();
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="isSwitching" class="workspace-overlay">
        <div class="flex flex-col items-center gap-4">
          <ProgressSpinner style="width: 48px; height: 48px" />
          <p class="text-lg font-medium text-white m-0">
            {{ $t('workspaceTransition.switchingTo', { workspace: switchingToName || t('workspaceSwitcher.workspace') }) }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.workspace-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
