<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';
import { AxiosError } from 'axios';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

const { t } = useI18n();
const auth = useAuth();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const saving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isValidPassword = computed(() => newPassword.value.length >= 8);

const showPasswordHint = computed(() =>
  newPassword.value.length > 0 && !isValidPassword.value,
);

const passwordsMatch = computed(() =>
  confirmPassword.value === '' || newPassword.value === confirmPassword.value,
);

const canSubmit = computed(() =>
  currentPassword.value.length > 0
  && isValidPassword.value
  && newPassword.value === confirmPassword.value,
);

function resetForm() {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
}

async function changePassword() {
  if (!canSubmit.value) return;

  saving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await auth.changePassword(currentPassword.value, newPassword.value);
    successMessage.value = t('profileSecurity.passwordChanged');
    resetForm();
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 400) {
      errorMessage.value = t('profileSecurity.incorrectCurrentPassword');
    } else {
      errorMessage.value = t('profileSecurity.changeFailed');
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-0">
    <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">{{ $t('profileSecurity.title') }}</h2>

    <div class="flex flex-col gap-4 mt-4 max-w-[400px]">
      <Message v-if="successMessage" severity="success" :closable="false">
        {{ successMessage }}
      </Message>
      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

      <div class="flex flex-col gap-1.5">
        <label for="currentPassword" class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">{{ $t('profileSecurity.currentPassword') }}</label>
        <Password
          id="currentPassword"
          v-model="currentPassword"
          :placeholder="$t('profileSecurity.currentPasswordPlaceholder')"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="newPassword" class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">{{ $t('profileSecurity.newPassword') }}</label>
        <Password
          id="newPassword"
          v-model="newPassword"
          :placeholder="$t('profileSecurity.newPasswordPlaceholder')"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          class="w-full"
          :invalid="showPasswordHint"
        />
        <small v-if="showPasswordHint" class="text-[var(--color-danger)] text-xs">{{ $t('profileSecurity.passwordTooShort') }}</small>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="confirmNewPassword" class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">{{ $t('profileSecurity.confirmNewPassword') }}</label>
        <Password
          id="confirmNewPassword"
          v-model="confirmPassword"
          :placeholder="$t('profileSecurity.confirmNewPasswordPlaceholder')"
          :feedback="false"
          toggleMask
          inputClass="w-full"
          class="w-full"
          :invalid="!passwordsMatch"
        />
        <small v-if="!passwordsMatch" class="text-[var(--color-danger)] text-xs">{{ $t('profileSecurity.passwordsDoNotMatch') }}</small>
      </div>

      <div class="flex items-center pt-2">
        <Button
          type="button"
          :label="$t('profileSecurity.changePassword')"
          :disabled="!canSubmit || saving"
          :loading="saving"
          @click="changePassword"
        />
      </div>
    </div>
  </div>
</template>
