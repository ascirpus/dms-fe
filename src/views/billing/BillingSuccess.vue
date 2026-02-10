<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQueryClient } from 'vue-query';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();
const queryClient = useQueryClient();

onMounted(() => {
    queryClient.invalidateQueries(['tenant']);
    queryClient.invalidateQueries(['billingStatus']);
});
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-6 p-16 max-w-lg mx-auto text-center">
        <i class="pi pi-check-circle text-6xl text-[#27ae60]"></i>
        <h1 class="font-[Inter,sans-serif] font-semibold text-2xl text-[var(--text-color)] m-0">{{ $t('billingSuccess.title') }}</h1>
        <p class="text-sm text-[var(--text-secondary)] leading-normal m-0">
            {{ $t('billingSuccess.message') }}
        </p>
        <Button
            :label="$t('billingSuccess.goToWorkspace')"
            icon="pi pi-arrow-right"
            @click="router.push({ name: 'workspace-overview' })"
        />
    </div>
</template>
