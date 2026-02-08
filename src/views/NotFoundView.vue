<!-- src/views/NotFoundView.vue -->
<template>
  <div class="flex items-center justify-center min-h-[70vh] text-center">
    <div class="max-w-[500px] p-8">
      <div class="text-[5rem] font-bold text-[var(--primary-color)] mb-4">404</div>
      <h1 class="mb-4 text-[var(--secondary-color)]">Page Not Found</h1>
      <p class="mb-8 text-gray-500">The page you are looking for doesn't exist or has been moved.</p>
      <router-link to="/" class="inline-block bg-[var(--primary-color)] text-white py-3 px-6 rounded-sm no-underline font-semibold transition-colors duration-300 hover:bg-[#2980b9]">Go to Home</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
}
</script>
