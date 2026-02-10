<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { AxiosError } from 'axios';
import { useAuth } from '@/composables/useAuth';
import { useInvites } from '@/composables/useInvites';
import { useWorkspace } from '@/composables/useWorkspace';
import Logo from '@/components/base/Logo.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { acceptInvite, joinTenant } = useInvites();
const { switchWorkspace } = useWorkspace();

const inviteId = computed(() => route.params.inviteId as string);
const email = computed(() => (route.query.email as string) ?? '');
const tenantId = computed(() => (route.query.tenantId as string) ?? '');
const workspaceName = computed(() => (route.query.workspace as string) ?? 'a workspace');

type PageState = 'loading' | 'invite-prompt' | 'register-form' | 'accepting' | 'success' | 'register-success' | 'error';
const state = ref<PageState>('loading');
const errorMessage = ref('');

const firstName = ref('');
const lastName = ref('');
const isSubmitting = ref(false);

onMounted(async () => {
  if (auth.isAuthenticated.value) {
    await tryAcceptInvite();
  } else {
    state.value = 'invite-prompt';
  }
});

async function tryAcceptInvite() {
  state.value = 'accepting';
  try {
    const result = await acceptInvite(inviteId.value);
    if (tenantId.value) {
      await switchWorkspace(tenantId.value);
    }
    const firstAssignment = result.projectAssignments?.[0];
    if (firstAssignment) {
      router.push({ name: 'project-details', params: { id: firstAssignment.projectId } });
    } else {
      router.push({ name: 'projects' });
    }
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const status = err.response.status;
      if (status === 404) {
        errorMessage.value = t('invite.invalidInvite');
      } else if (status === 410) {
        errorMessage.value = t('invite.expiredInvite');
      } else if (status === 409) {
        errorMessage.value = t('invite.alreadyMember');
      } else {
        errorMessage.value = err.response.data?.error?.message ?? t('invite.failedToAccept');
      }
    } else {
      errorMessage.value = t('invite.serverError');
    }
    state.value = 'error';
  }
}

function loginAndReturn() {
  auth.login(window.location.href);
}

function showRegisterForm() {
  state.value = 'register-form';
}

async function submitRegistration() {
  if (!email.value || !tenantId.value) {
    errorMessage.value = t('invite.invalidLink');
    state.value = 'error';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    await joinTenant({
      email: email.value,
      tenantId: tenantId.value,
      firstName: firstName.value.trim() || undefined,
      lastName: lastName.value.trim() || undefined,
    });
    state.value = 'register-success';
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const data = err.response.data;
      if (err.response.status === 409) {
        errorMessage.value = t('invite.accountExists');
      } else {
        errorMessage.value = data?.error?.message ?? t('invite.registrationFailed');
      }
    } else {
      errorMessage.value = t('invite.serverError');
    }
  } finally {
    isSubmitting.value = false;
  }
}

function goToProjects() {
  router.push({ name: 'projects' });
}
</script>

<template>
  <div class="flex min-h-screen w-full bg-[var(--surface-section)] justify-center">
    <div class="w-full max-w-[482px] flex flex-col justify-center py-24 px-7 max-[540px]:py-12 max-[540px]:px-5">
      <div class="flex flex-col gap-6 w-full max-w-[426px]">
        <Logo size="lg" />

        <!-- Loading / Accepting -->
        <div v-if="state === 'loading' || state === 'accepting'" class="flex flex-col items-center gap-4 py-8">
          <ProgressSpinner style="width: 48px; height: 48px" />
          <p class="text-[var(--text-secondary)] m-0">{{ $t('invite.acceptingInvite') }}</p>
        </div>

        <!-- Invite Prompt (unauthenticated) -->
        <template v-else-if="state === 'invite-prompt'">
          <div class="flex flex-col items-center gap-2 text-center">
            <i class="pi pi-users text-4xl text-[var(--primary-color)]"></i>
            <h1 class="font-[Inter,sans-serif] font-semibold text-[28px] leading-[1.25] text-[var(--text-color)] m-0">
              {{ $t('invite.youveBeenInvited') }}
            </h1>
            <p class="text-lg font-medium text-[var(--primary-color)] m-0">{{ workspaceName }}</p>
          </div>

          <div class="flex flex-col gap-3">
            <Button
              :label="$t('invite.signInToAccept')"
              icon="pi pi-sign-in"
              class="w-full"
              @click="loginAndReturn"
            />
            <Button
              :label="$t('invite.createAccount')"
              icon="pi pi-user-plus"
              severity="secondary"
              outlined
              class="w-full"
              @click="showRegisterForm"
            />
          </div>
        </template>

        <!-- Registration Form -->
        <template v-else-if="state === 'register-form'">
          <h1 class="font-[Inter,sans-serif] font-semibold text-[28px] leading-[1.25] text-[var(--text-color)] m-0">
            {{ $t('invite.createAccount') }}
          </h1>
          <i18n-t keypath="invite.joinWorkspace" tag="p" class="text-sm text-[var(--text-secondary)] m-0">
            <template #workspace><strong>{{ workspaceName }}</strong></template>
          </i18n-t>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <div class="flex flex-col gap-1.5">
            <label for="regEmail" class="font-semibold text-sm text-[var(--text-color)]">{{ $t('invite.emailAddress') }}</label>
            <InputText
              id="regEmail"
              :model-value="email"
              readonly
              class="w-full bg-[var(--surface-ground)]"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="regFirstName" class="font-semibold text-sm text-[var(--text-color)]">
                {{ $t('invite.firstName') }} <span class="font-normal text-[var(--text-secondary)]">({{ $t('common.optional') }})</span>
              </label>
              <InputText
                id="regFirstName"
                v-model="firstName"
                :placeholder="$t('invite.firstName')"
                class="w-full"
                @keypress.enter="submitRegistration"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="regLastName" class="font-semibold text-sm text-[var(--text-color)]">
                {{ $t('invite.lastName') }} <span class="font-normal text-[var(--text-secondary)]">({{ $t('common.optional') }})</span>
              </label>
              <InputText
                id="regLastName"
                v-model="lastName"
                :placeholder="$t('invite.lastName')"
                class="w-full"
                @keypress.enter="submitRegistration"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <Button
              :label="$t('common.back')"
              text
              severity="secondary"
              @click="state = 'invite-prompt'"
            />
            <Button
              :label="$t('invite.createAccount')"
              icon="pi pi-user-plus"
              @click="submitRegistration"
              :loading="isSubmitting"
            />
          </div>
        </template>

        <!-- Register Success -->
        <template v-else-if="state === 'register-success'">
          <div class="flex flex-col items-center gap-4 py-4">
            <i class="pi pi-check-circle text-5xl text-green-500"></i>
            <h1 class="font-[Inter,sans-serif] font-semibold text-[28px] leading-[1.25] text-[var(--text-color)] m-0 text-center">
              {{ $t('invite.accountCreated') }}
            </h1>
            <i18n-t keypath="invite.checkEmail" tag="p" class="text-sm text-[var(--text-secondary)] m-0 text-center">
              <template #workspace><strong>{{ workspaceName }}</strong></template>
            </i18n-t>
          </div>
          <Button
            :label="$t('common.signIn')"
            icon="pi pi-sign-in"
            class="w-full"
            @click="loginAndReturn"
          />
        </template>

        <!-- Error -->
        <template v-else-if="state === 'error'">
          <div class="flex flex-col items-center gap-4 py-4">
            <i class="pi pi-exclamation-triangle text-5xl text-[var(--color-danger,#e74c3c)]"></i>
            <h1 class="font-[Inter,sans-serif] font-semibold text-[24px] leading-[1.25] text-[var(--text-color)] m-0 text-center">
              {{ $t('invite.unableToAccept') }}
            </h1>
            <p class="text-sm text-[var(--text-secondary)] m-0 text-center">
              {{ errorMessage }}
            </p>
          </div>
          <Button
            v-if="auth.isAuthenticated.value"
            :label="$t('common.goToProjects')"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="w-full"
            @click="goToProjects"
          />
          <Button
            v-else
            :label="$t('common.signIn')"
            icon="pi pi-sign-in"
            class="w-full"
            @click="loginAndReturn"
          />
        </template>
      </div>
    </div>
  </div>
</template>
