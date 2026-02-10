<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Logo from "@/components/base/Logo.vue";
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();

// Form state
const email = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false);

// Validation
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

// Submit password recovery request
const submitRecovery = async () => {
  if (!isValidEmail.value) return;

  isLoading.value = true;

  try {
    // In a real implementation, this would call the Keycloak password reset endpoint
    await new Promise(resolve => setTimeout(resolve, 1000));
    isSubmitted.value = true;
  } catch (error) {
    console.error('Password recovery error:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    submitRecovery();
  }
};

// Navigate back to login
const backToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="flex min-h-screen w-full bg-white/90 justify-center">
    <div class="w-full max-w-[482px] flex flex-col justify-center py-24 px-7 max-[540px]:py-12 max-[540px]:px-5">
      <div class="flex flex-col gap-6 w-full max-w-[426px]">
        <!-- Logo -->
        <Logo size="lg" :show-tagline="true" />

        <!-- Heading -->
        <h1 class="font-[Inter,sans-serif] font-semibold text-[32px] leading-[1.25] text-slate-800 m-0">{{ $t('passwordRecovery.title') }}</h1>

        <!-- Form State: Email Input -->
        <template v-if="!isSubmitted">
          <div class="flex flex-col gap-1.5">
            <label for="email" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">{{ $t('passwordRecovery.emailLabel') }}</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('passwordRecovery.emailPlaceholder')"
              class="w-full"
              @keypress="handleKeyPress"
            />
          </div>

          <div class="flex justify-between items-center max-[540px]:flex-col max-[540px]:gap-3 max-[540px]:items-start">
            <Button
              type="button"
              @click="submitRecovery"
              :disabled="!isValidEmail || isLoading"
              :loading="isLoading"
              :label="$t('passwordRecovery.continue')"
            />
            <Button
              type="button"
              @click="backToLogin"
              :label="$t('passwordRecovery.backToSignIn')"
              link
            />
          </div>
        </template>

        <!-- Confirmation State: Email Sent -->
        <template v-else>
          <p class="font-[Inter,sans-serif] font-medium text-sm leading-[1.5] text-[var(--text-color)] m-0">
            {{ $t('passwordRecovery.confirmationMessage') }}
          </p>

          <div class="flex justify-between items-center max-[540px]:flex-col max-[540px]:gap-3 max-[540px]:items-start">
            <Button
              type="button"
              @click="backToLogin"
              :label="$t('passwordRecovery.continue')"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
