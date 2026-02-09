<template>
  <footer class="border-t border-solid border-[var(--surface-border)]">
    <div class="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-4 px-6 text-sm text-[var(--text-secondary)]">
      <div class="flex items-center gap-4">
        <router-link to="/terms" class="hover:underline text-[var(--text-secondary)]">Terms of Service</router-link>
        <router-link to="/privacy" class="hover:underline text-[var(--text-secondary)]">Privacy Policy</router-link>
      </div>
      <a href="mailto:support@cedar-stack.com" class="hover:underline text-[var(--text-secondary)]">support@cedar-stack.com</a>
    </div>
  </footer>
</template>
