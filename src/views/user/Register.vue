<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import Logo from '@/components/base/Logo.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { RegistrationService } from '@/services/RegistrationService';
import type { RegistrationErrorResponse } from '@/types';

interface TurnstileInstance {
  render: (element: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback': () => void;
    'expired-callback': () => void;
    theme: 'light' | 'dark' | 'auto';
  }) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

const router = useRouter();
const route = useRoute();
const service = new RegistrationService();

const email = ref('');
const companyName = ref('');
const firstName = ref('');
const lastName = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false);
const errorMessage = ref('');
const captchaToken = ref('');
const turnstileRef = ref<HTMLElement | null>(null);
let widgetId: string | null = null;

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const plan = computed(() => route.query.plan as string | undefined);

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const canSubmit = computed(() =>
  isValidEmail.value && companyName.value.trim().length > 0 && captchaToken.value.length > 0,
);

const renderTurnstile = () => {
  if (!turnstileRef.value || !window.turnstile) return;

  const isDark = document.documentElement.classList.contains('dark');
  widgetId = window.turnstile.render(turnstileRef.value, {
    sitekey: siteKey,
    callback: (token: string) => { captchaToken.value = token; },
    'error-callback': () => { captchaToken.value = ''; },
    'expired-callback': () => { captchaToken.value = ''; },
    theme: isDark ? 'dark' : 'light',
  });
};

onMounted(() => {
  if (window.turnstile) {
    renderTurnstile();
  } else {
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        renderTurnstile();
      }
    }, 100);
    setTimeout(() => clearInterval(interval), 10000);
  }
});

onUnmounted(() => {
  if (widgetId && window.turnstile) {
    window.turnstile.remove(widgetId);
  }
});

const submitRegistration = async () => {
  if (!canSubmit.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await service.registerCompany({
      email: email.value,
      companyName: companyName.value.trim(),
      firstName: firstName.value.trim() || undefined,
      lastName: lastName.value.trim() || undefined,
      captchaToken: captchaToken.value,
    });
    isSubmitted.value = true;
  } catch (error) {
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
      captchaToken.value = '';
    }

    if (error instanceof AxiosError && error.response) {
      const data = error.response.data as RegistrationErrorResponse;
      if (error.response.status === 409 && data?.error?.code === 'USER_ALREADY_EXISTS') {
        errorMessage.value = 'An account with this email already exists. Please sign in instead.';
      } else {
        errorMessage.value = data?.error?.message || 'Registration failed. Please try again.';
      }
    } else {
      errorMessage.value = 'Unable to connect to the server. Please check your connection and try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    submitRegistration();
  }
};

const goToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="flex min-h-screen w-full bg-[var(--surface-section)] justify-center">
    <div class="w-full max-w-[482px] flex flex-col justify-center py-24 px-7 max-[540px]:py-12 max-[540px]:px-5">
      <div class="flex flex-col gap-6 w-full max-w-[426px]">
        <Logo size="lg" :show-tagline="true" />

        <h1 class="font-[Inter,sans-serif] font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">Create Account</h1>

        <template v-if="!isSubmitted">
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <div class="flex flex-col gap-1.5">
            <label for="email" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Email Address</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="you@company.com"
              class="w-full"
              @keypress="handleKeyPress"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="companyName" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Workspace Name</label>
            <InputText
              id="companyName"
              v-model="companyName"
              type="text"
              placeholder="Your company or team name"
              class="w-full"
              @keypress="handleKeyPress"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="firstName" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">First Name <span class="font-normal text-[var(--text-secondary)]">(optional)</span></label>
              <InputText
                id="firstName"
                v-model="firstName"
                type="text"
                placeholder="First name"
                class="w-full"
                @keypress="handleKeyPress"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="lastName" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Last Name <span class="font-normal text-[var(--text-secondary)]">(optional)</span></label>
              <InputText
                id="lastName"
                v-model="lastName"
                type="text"
                placeholder="Last name"
                class="w-full"
                @keypress="handleKeyPress"
              />
            </div>
          </div>

          <div ref="turnstileRef" data-testid="turnstile-container"></div>

          <div class="flex justify-between items-center max-[540px]:flex-col max-[540px]:gap-3 max-[540px]:items-start">
            <Button
              type="button"
              @click="submitRegistration"
              :disabled="!canSubmit || isLoading"
              :loading="isLoading"
              label="Create Account"
            />
            <Button
              type="button"
              @click="goToLogin"
              label="Already have an account?"
              link
            />
          </div>
        </template>

        <template v-else>
          <div class="flex flex-col items-center gap-4 py-4">
            <i class="pi pi-envelope text-4xl text-[var(--primary-color)]"></i>
            <p class="font-[Inter,sans-serif] font-medium text-sm leading-[1.5] text-[var(--text-color)] m-0 text-center">
              We've sent a verification link to <strong>{{ email }}</strong>. Please check your inbox to complete your registration.
            </p>
          </div>

          <div class="flex justify-between items-center max-[540px]:flex-col max-[540px]:gap-3 max-[540px]:items-start">
            <Button
              type="button"
              @click="goToLogin"
              label="Continue to Sign In"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
