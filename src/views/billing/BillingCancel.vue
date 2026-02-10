<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-6 p-16 max-w-lg mx-auto text-center">
        <i class="pi pi-exclamation-triangle text-6xl text-[#e74c3c]"></i>
        <h1 class="font-[Inter,sans-serif] font-semibold text-2xl text-[var(--text-color)] m-0">{{ $t('billingCancel.title') }}</h1>
        <p class="text-sm text-[var(--text-secondary)] leading-normal m-0">
            {{ $t('billingCancel.message') }}
        </p>
        <div class="flex gap-3">
            <Button
                :label="$t('billingCancel.tryAgain')"
                icon="pi pi-refresh"
                @click="router.push({ name: 'workspace-overview' })"
            />
            <Button
                :label="$t('billingCancel.goToProjects')"
                icon="pi pi-folder"
                severity="secondary"
                text
                @click="router.push({ name: 'projects' })"
            />
        </div>
    </div>
</template>
