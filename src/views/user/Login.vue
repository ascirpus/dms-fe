<script setup lang="ts">
import { ref } from 'vue';
import Logo from "@/components/base/Logo.vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const errorMessage = ref('');

const username = ref('');
const password = ref('');

const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter username and password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const tokenUrl = `${import.meta.env.VITE_AUTH_PROVIDER}/realms/${import.meta.env.VITE_AUTH_REALM}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', import.meta.env.VITE_AUTH_CLIENT_ID);
    params.append('username', username.value);
    params.append('password', password.value);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (response.ok) {
      const tokens = await response.json();

      // Store tokens in authStore (persisted to sessionStorage)
      authStore.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);

      // Navigate to home page
      router.push({ name: 'home' });
    } else {
      const error = await response.json();
      if (error.error === 'invalid_grant') {
        errorMessage.value = 'Invalid username or password';
      } else {
        errorMessage.value = error.error_description || 'Login failed';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Unable to connect to authentication server';
  } finally {
    isLoading.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    login();
  }
};

const forgotPassword = () => {
  router.push({ name: 'password-recovery' });
};
</script>

<template>
  <div class="login-page">
    <!-- Left panel - Login form -->
    <div class="login-panel">
      <div class="login-content">
        <!-- Logo -->
        <Logo size="lg" :show-tagline="true" />

        <!-- Heading -->
        <h1 class="login-heading">Sign in</h1>

        <!-- Error message -->
        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <!-- Form fields -->
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <InputText
            id="username"
            v-model="username"
            placeholder="Email Address"
            class="w-full"
            @keypress="handleKeyPress"
          />
        </div>

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
            @keypress="handleKeyPress"
          />
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <Button
            type="button"
            @click="login"
            :disabled="isLoading"
            :loading="isLoading"
            label="Continue"
          />
          <Button
            type="button"
            @click="forgotPassword"
            label="Forgot Password?"
            link
          />
        </div>
      </div>
    </div>

    <!-- Right panel - Background image -->
    <div class="background-panel">
      <div class="background-image"></div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.login-panel {
  width: 482px;
  min-width: 482px;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 96px 28px;
}

.login-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 426px;
}

.login-heading {
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

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.background-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.background-image {
  position: absolute;
  inset: 0;
  background-image: url('/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-color: #475569;
}

@media (max-width: 1024px) {
  .login-panel {
    width: 100%;
    min-width: unset;
    max-width: 482px;
  }

  .background-panel {
    display: none;
  }

  .login-page {
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }
}

@media (max-width: 540px) {
  .login-panel {
    padding: 48px 20px;
  }
}
</style>
