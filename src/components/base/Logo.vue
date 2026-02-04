<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}>();
</script>

<template>
  <div class="app-logo" :class="[size ?? 'md']">
    <img src="/images/logo.svg" alt="CedarStack Logo" class="logo-icon" />
    <img src="/images/logo-text.svg" alt="CedarStack" class="logo-text" />
    <div v-if="showTagline" class="logo-tagline">
      <span>Intelligent</span>
      <span>Document Hub</span>
    </div>
  </div>
</template>

<style scoped>
.app-logo {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.logo-icon {
  display: block;
  height: auto;
}

.logo-text {
  display: block;
  height: auto;
}

.logo-tagline {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  margin-left: 8px;
}

/* Size variants */
.sm .logo-icon {
  width: 32px;
}

.sm .logo-text {
  width: 60px;
}

.md .logo-icon {
  width: 42px;
}

.md .logo-text {
  width: 80px;
}

.lg .logo-icon {
  width: 53px;
}

.lg .logo-text {
  width: 102px;
}
</style>
