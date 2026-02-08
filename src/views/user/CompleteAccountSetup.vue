<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Logo from "@/components/base/Logo.vue";
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const route = useRoute();

// Form state - username/email may come from invite token
const username = ref(route.query.email?.toString() || 'emailaddress@company.com');
const firstName = ref(route.query.firstName?.toString() || '');
const lastName = ref(route.query.lastName?.toString() || '');
const phoneNumber = ref('');
const password = ref('');
const confirmPassword = ref('');

const isLoading = ref(false);
const errorMessage = ref('');

// Validation
const isValidForm = computed(() => {
  return (
    firstName.value.trim() !== '' &&
    lastName.value.trim() !== '' &&
    password.value.length >= 8 &&
    password.value === confirmPassword.value
  );
});

const passwordsMatch = computed(() => {
  return confirmPassword.value === '' || password.value === confirmPassword.value;
});

// Submit account setup
const completeSetup = async () => {
  if (!isValidForm.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // In a real implementation, this would call the API to complete account setup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to login after successful setup
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Account setup error:', error);
    errorMessage.value = 'Failed to complete account setup. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen w-full bg-white/90 justify-center">
    <div class="w-full max-w-[482px] flex flex-col justify-center py-15 px-7 max-[540px]:py-12 max-[540px]:px-5">
      <div class="flex flex-col gap-6 w-full max-w-[426px]">
        <!-- Logo -->
        <Logo size="lg" :show-tagline="true" />

        <!-- Heading -->
        <h1 class="font-[Inter,sans-serif] font-semibold text-[32px] leading-[1.25] text-slate-800 m-0">Complete Account Setup</h1>

        <!-- Error message -->
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <!-- Username (read-only) -->
        <div class="flex flex-col gap-1.5">
          <label class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Username</label>
          <p class="font-[Inter,sans-serif] font-normal text-sm leading-5 text-[var(--text-color)] m-0 py-2">{{ username }}</p>
        </div>

        <!-- Firstname -->
        <div class="flex flex-col gap-1.5">
          <label for="firstName" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Firstname</label>
          <InputText
            id="firstName"
            v-model="firstName"
            placeholder="Prefilled by Invite"
            class="w-full"
          />
        </div>

        <!-- Lastname -->
        <div class="flex flex-col gap-1.5">
          <label for="lastName" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Lastname</label>
          <InputText
            id="lastName"
            v-model="lastName"
            placeholder="Prefilled by Invite"
            class="w-full"
          />
        </div>

        <!-- Phone Number -->
        <div class="flex flex-col gap-1.5">
          <label for="phoneNumber" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Phone Number</label>
          <InputText
            id="phoneNumber"
            v-model="phoneNumber"
            type="tel"
            placeholder="Your Phone Number"
            class="w-full"
          />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label for="password" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Your Password"
            :feedback="false"
            toggleMask
            inputClass="w-full"
            class="w-full"
          />
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col gap-1.5">
          <label for="confirmPassword" class="font-[Inter,sans-serif] font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Confirm Password</label>
          <Password
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm Your Password"
            :feedback="false"
            toggleMask
            inputClass="w-full"
            class="w-full"
            :invalid="!passwordsMatch"
          />
          <small v-if="!passwordsMatch" class="text-[var(--color-danger)] font-[Inter,sans-serif] text-xs">Passwords do not match</small>
        </div>

        <!-- Submit -->
        <div class="flex items-center">
          <Button
            type="button"
            @click="completeSetup"
            :disabled="!isValidForm || isLoading"
            :loading="isLoading"
            label="Complete Setup"
          />
        </div>
      </div>
    </div>
  </div>
</template>
