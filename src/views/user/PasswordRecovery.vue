<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Logo from "@/components/base/Logo.vue";
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

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
  <div class="recovery-page">
    <div class="recovery-panel">
      <div class="recovery-content">
        <!-- Logo -->
        <Logo size="lg" :show-tagline="true" />

        <!-- Heading -->
        <h1 class="recovery-heading">Password Recovery</h1>

        <!-- Form State: Email Input -->
        <template v-if="!isSubmitted">
          <div class="form-group">
            <label for="email" class="form-label">Your Email Address</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Email Address"
              class="w-full"
              @keypress="handleKeyPress"
            />
          </div>

          <div class="form-actions">
            <Button
              type="button"
              @click="submitRecovery"
              :disabled="!isValidEmail || isLoading"
              :loading="isLoading"
              label="Continue"
            />
            <Button
              type="button"
              @click="backToLogin"
              label="Back to sign in"
              link
            />
          </div>
        </template>

        <!-- Confirmation State: Email Sent -->
        <template v-else>
          <p class="recovery-message">
            We've sent a password reset link to your email. Please check your inbox (and spam folder just in case).
          </p>

          <div class="form-actions">
            <Button
              type="button"
              @click="backToLogin"
              label="Continue"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recovery-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
}

.recovery-panel {
  width: 100%;
  max-width: 482px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 96px 28px;
}

.recovery-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 426px;
}

.recovery-heading {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.25;
  color: #1e293b;
  margin: 0;
}

.recovery-message {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
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

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 540px) {
  .recovery-panel {
    padding: 48px 20px;
  }

  .form-actions {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
