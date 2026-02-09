<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useAuth } from '@/composables/useAuth';
import { useInvites } from '@/composables/useInvites';
import { useWorkspace } from '@/composables/useWorkspace';
import Logo from '@/components/base/Logo.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

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
    await acceptInvite(inviteId.value);
    if (tenantId.value) {
      await switchWorkspace(tenantId.value);
    } else {
      router.push({ name: 'projects' });
    }
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const status = err.response.status;
      if (status === 404) {
        errorMessage.value = 'This invite link is invalid or has already been used.';
      } else if (status === 410) {
        errorMessage.value = 'This invite has expired. Please ask the workspace admin for a new invite.';
      } else if (status === 409) {
        errorMessage.value = 'You are already a member of this workspace.';
      } else {
        errorMessage.value = err.response.data?.error?.message ?? 'Failed to accept invite.';
      }
    } else {
      errorMessage.value = 'Unable to connect to the server. Please try again.';
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
    errorMessage.value = 'Invalid invite link: missing required information.';
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
        errorMessage.value = 'An account with this email already exists. Please sign in instead.';
      } else {
        errorMessage.value = data?.error?.message ?? 'Registration failed. Please try again.';
      }
    } else {
      errorMessage.value = 'Unable to connect to the server. Please try again.';
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
          <p class="text-[var(--text-secondary)] m-0">Accepting invite...</p>
        </div>

        <!-- Invite Prompt (unauthenticated) -->
        <template v-else-if="state === 'invite-prompt'">
          <div class="flex flex-col items-center gap-2 text-center">
            <i class="pi pi-users text-4xl text-[var(--primary-color)]"></i>
            <h1 class="font-[Inter,sans-serif] font-semibold text-[28px] leading-[1.25] text-[var(--text-color)] m-0">
              You've been invited to join
            </h1>
            <p class="text-lg font-medium text-[var(--primary-color)] m-0">{{ workspaceName }}</p>
          </div>

          <div class="flex flex-col gap-3">
            <Button
              label="Sign In to Accept"
              icon="pi pi-sign-in"
              class="w-full"
              @click="loginAndReturn"
            />
            <Button
              label="Create Account"
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
            Create Account
          </h1>
          <p class="text-sm text-[var(--text-secondary)] m-0">
            Join <strong>{{ workspaceName }}</strong> by creating your account.
          </p>

          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <div class="flex flex-col gap-1.5">
            <label for="regEmail" class="font-semibold text-sm text-[var(--text-color)]">Email Address</label>
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
                First Name <span class="font-normal text-[var(--text-secondary)]">(optional)</span>
              </label>
              <InputText
                id="regFirstName"
                v-model="firstName"
                placeholder="First name"
                class="w-full"
                @keypress.enter="submitRegistration"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="regLastName" class="font-semibold text-sm text-[var(--text-color)]">
                Last Name <span class="font-normal text-[var(--text-secondary)]">(optional)</span>
              </label>
              <InputText
                id="regLastName"
                v-model="lastName"
                placeholder="Last name"
                class="w-full"
                @keypress.enter="submitRegistration"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <Button
              label="Back"
              text
              severity="secondary"
              @click="state = 'invite-prompt'"
            />
            <Button
              label="Create Account"
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
              Account Created
            </h1>
            <p class="text-sm text-[var(--text-secondary)] m-0 text-center">
              Check your email for a temporary password, then sign in to access <strong>{{ workspaceName }}</strong>.
            </p>
          </div>
          <Button
            label="Sign In"
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
              Unable to Accept Invite
            </h1>
            <p class="text-sm text-[var(--text-secondary)] m-0 text-center">
              {{ errorMessage }}
            </p>
          </div>
          <Button
            v-if="auth.isAuthenticated.value"
            label="Go to Projects"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="w-full"
            @click="goToProjects"
          />
          <Button
            v-else
            label="Sign In"
            icon="pi pi-sign-in"
            class="w-full"
            @click="loginAndReturn"
          />
        </template>
      </div>
    </div>
  </div>
</template>
