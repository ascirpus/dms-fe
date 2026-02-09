<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

const router = useRouter();
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-6 p-16 max-w-lg mx-auto text-center">
        <i class="pi pi-exclamation-triangle text-6xl text-[#e74c3c]"></i>
        <h1 class="font-[Inter,sans-serif] font-semibold text-2xl text-[var(--text-color)] m-0">Payment Cancelled</h1>
        <p class="text-sm text-[var(--text-secondary)] leading-normal m-0">
            Your checkout was cancelled. No charges were made.
        </p>
        <div class="flex gap-3">
            <Button
                label="Try Again"
                icon="pi pi-refresh"
                @click="router.push({ name: 'workspace-overview' })"
            />
            <Button
                label="Go to Projects"
                icon="pi pi-folder"
                severity="secondary"
                text
                @click="router.push({ name: 'projects' })"
            />
        </div>
    </div>
</template>
