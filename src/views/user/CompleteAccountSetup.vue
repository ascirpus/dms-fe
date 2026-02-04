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
  <div class="setup-page">
    <div class="setup-panel">
      <div class="setup-content">
        <!-- Logo -->
        <Logo size="lg" :show-tagline="true" />

        <!-- Heading -->
        <h1 class="setup-heading">Complete Account Setup</h1>

        <!-- Error message -->
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <!-- Username (read-only) -->
        <div class="form-group">
          <label class="form-label">Username</label>
          <p class="form-value">{{ username }}</p>
        </div>

        <!-- Firstname -->
        <div class="form-group">
          <label for="firstName" class="form-label">Firstname</label>
          <InputText
            id="firstName"
            v-model="firstName"
            placeholder="Prefilled by Invite"
            class="w-full"
          />
        </div>

        <!-- Lastname -->
        <div class="form-group">
          <label for="lastName" class="form-label">Lastname</label>
          <InputText
            id="lastName"
            v-model="lastName"
            placeholder="Prefilled by Invite"
            class="w-full"
          />
        </div>

        <!-- Phone Number -->
        <div class="form-group">
          <label for="phoneNumber" class="form-label">Phone Number</label>
          <InputText
            id="phoneNumber"
            v-model="phoneNumber"
            type="tel"
            placeholder="Your Phone Number"
            class="w-full"
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
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
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
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
          <small v-if="!passwordsMatch" class="field-error">Passwords do not match</small>
        </div>

        <!-- Submit -->
        <div class="form-actions">
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

<style scoped>
.setup-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
}

.setup-panel {
  width: 100%;
  max-width: 482px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 28px;
}

.setup-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 426px;
}

.setup-heading {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.25;
  color: #1e293b;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

.form-value {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-color);
  margin: 0;
  padding: 8px 0;
}

.field-error {
  color: var(--color-danger);
  font-family: 'Inter', sans-serif;
  font-size: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
}

@media (max-width: 540px) {
  .setup-panel {
    padding: 48px 20px;
  }
}
</style>
