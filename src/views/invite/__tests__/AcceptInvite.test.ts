import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { createI18n } from 'vue-i18n';
import AcceptInvite from '../AcceptInvite.vue';

const mockRoute = {
  params: { inviteId: 'inv-123' },
  query: { email: 'invited@test.com', tenantId: 't1', workspace: 'Acme Corp' },
};

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: vi.fn() }),
}));

const mockAcceptInvite = vi.fn();
const mockJoinTenant = vi.fn();

vi.mock('@/composables/useInvites', () => ({
  useInvites: () => ({
    acceptInvite: mockAcceptInvite,
    joinTenant: mockJoinTenant,
  }),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: ref(false),
    login: vi.fn(),
  }),
}));

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: () => ({
    switchWorkspace: vi.fn(),
  }),
}));

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      invite: {
        acceptingInvite: 'Accepting invite...',
        youveBeenInvited: "You've been invited to join",
        signInToAccept: 'Sign In to Accept',
        createAccount: 'Create Account',
        joinWorkspace: 'Join {workspace} by creating your account.',
        emailAddress: 'Email Address',
        firstName: 'First Name',
        lastName: 'Last Name',
        password: 'Password',
        passwordPlaceholder: 'Minimum 8 characters',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: 'Re-enter your password',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordsDoNotMatch: 'Passwords do not match',
        accountCreated: 'Account Created',
        accountCreatedDetail: 'Your account has been created. Please verify your email, then sign in.',
        unableToAccept: 'Unable to Accept Invite',
        invalidInvite: 'This invite link is invalid or has already been used.',
        expiredInvite: 'This invite has expired.',
        alreadyMember: 'You are already a member of this workspace.',
        failedToAccept: 'Failed to accept invite.',
        serverError: 'Unable to connect to the server.',
        accountExists: 'An account with this email already exists.',
        signInInstead: 'Sign in instead.',
        registrationFailed: 'Registration failed. Please try again.',
      },
      common: {
        optional: 'optional',
        back: 'Back',
        signIn: 'Sign In',
        goToProjects: 'Go to Projects',
      },
    },
  },
});

const globalStubs = {
  Logo: { template: '<div class="logo-stub" />' },
  Button: {
    template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'loading', 'disabled', 'text', 'severity', 'outlined', 'iconPos'],
  },
  InputText: {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder', 'readonly'],
  },
  Password: {
    template: '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'toggleMask', 'feedback', 'inputClass', 'invalid'],
  },
  Message: {
    template: '<div class="message-stub"><slot /></div>',
    props: ['severity', 'closable'],
  },
  ProgressSpinner: { template: '<div class="spinner-stub" />' },
  'i18n-t': {
    template: '<span><slot /><slot name="workspace" /></span>',
    props: ['keypath', 'tag'],
  },
};

describe('AcceptInvite.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.params = { inviteId: 'inv-123' };
    mockRoute.query = { email: 'invited@test.com', tenantId: 't1', workspace: 'Acme Corp' };
  });

  it('should show invite prompt for unauthenticated user', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("You've been invited to join");
    expect(wrapper.text()).toContain('Acme Corp');
    expect(wrapper.text()).toContain('Sign In to Accept');
    expect(wrapper.text()).toContain('Create Account');
  });

  it('should show register form when Create Account is clicked', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    const buttons = wrapper.findAll('button');
    const createBtn = buttons.find(b => b.text().includes('Create Account'));
    await createBtn!.trigger('click');

    expect(wrapper.text()).toContain('Email Address');
    expect(wrapper.text()).toContain('invited@test.com');
    expect(wrapper.text()).toContain('Password');
    expect(wrapper.text()).toContain('Confirm Password');
  });

  it('should display email as plain text, not an input', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    const buttons = wrapper.findAll('button');
    const createBtn = buttons.find(b => b.text().includes('Create Account'));
    await createBtn!.trigger('click');

    expect(wrapper.find('#regEmail').exists()).toBe(false);
    expect(wrapper.text()).toContain('invited@test.com');
  });

  it('should disable submit when password is too short', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    await wrapper.vm.$nextTick();

    wrapper.vm.password = 'short';
    wrapper.vm.confirmPassword = 'short';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.canSubmit).toBe(false);
  });

  it('should disable submit when passwords do not match', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    await wrapper.vm.$nextTick();

    wrapper.vm.password = 'validpass123';
    wrapper.vm.confirmPassword = 'different123';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.canSubmit).toBe(false);
  });

  it('should enable submit when passwords are valid and match', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    await wrapper.vm.$nextTick();

    wrapper.vm.password = 'validpass123';
    wrapper.vm.confirmPassword = 'validpass123';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.canSubmit).toBe(true);
  });

  it('should call joinTenant with inviteId and password', async () => {
    mockJoinTenant.mockResolvedValue(undefined);

    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'securepass123';
    wrapper.vm.confirmPassword = 'securepass123';
    wrapper.vm.firstName = 'John';
    wrapper.vm.lastName = 'Doe';
    await wrapper.vm.$nextTick();

    await wrapper.vm.submitRegistration();
    await flushPromises();

    expect(mockJoinTenant).toHaveBeenCalledWith({
      inviteId: 'inv-123',
      password: 'securepass123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(wrapper.vm.state).toBe('register-success');
  });

  it('should not send email or tenantId to joinTenant', async () => {
    mockJoinTenant.mockResolvedValue(undefined);

    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'securepass123';
    wrapper.vm.confirmPassword = 'securepass123';
    await wrapper.vm.$nextTick();

    await wrapper.vm.submitRegistration();
    await flushPromises();

    const call = mockJoinTenant.mock.calls[0][0];
    expect(call).not.toHaveProperty('email');
    expect(call).not.toHaveProperty('tenantId');
    expect(call.inviteId).toBe('inv-123');
  });

  it('should not submit when canSubmit is false', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'short';
    wrapper.vm.confirmPassword = 'short';
    await wrapper.vm.$nextTick();

    await wrapper.vm.submitRegistration();
    await flushPromises();

    expect(mockJoinTenant).not.toHaveBeenCalled();
  });

  it('should show password hint when typing but too short', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'abc';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.showPasswordHint).toBe(true);
    expect(wrapper.text()).toContain('Password must be at least 8 characters');
  });

  it('should show mismatch hint when passwords differ', async () => {
    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'validpass123';
    wrapper.vm.confirmPassword = 'different';
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.passwordsMatch).toBe(false);
    expect(wrapper.text()).toContain('Passwords do not match');
  });

  it('should show sign-in link when account already exists', async () => {
    const axiosError = {
      response: { status: 409, data: {} },
      isAxiosError: true,
    };
    Object.setPrototypeOf(axiosError, new Error());
    // Make it pass the AxiosError instanceof check
    const { AxiosError } = await import('axios');
    mockJoinTenant.mockRejectedValue(Object.assign(new AxiosError(), { response: { status: 409, data: {} } }));

    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'securepass123';
    wrapper.vm.confirmPassword = 'securepass123';
    await wrapper.vm.$nextTick();

    await wrapper.vm.submitRegistration();
    await flushPromises();

    expect(wrapper.text()).toContain('An account with this email already exists.');
    expect(wrapper.text()).toContain('Sign in instead.');
    expect(wrapper.find('a').exists()).toBe(true);
  });

  it('should show success page after registration', async () => {
    mockJoinTenant.mockResolvedValue(undefined);

    const wrapper = mount(AcceptInvite, {
      global: { stubs: globalStubs, plugins: [i18n] },
    });
    await flushPromises();

    wrapper.vm.state = 'register-form';
    wrapper.vm.password = 'securepass123';
    wrapper.vm.confirmPassword = 'securepass123';
    await wrapper.vm.$nextTick();

    await wrapper.vm.submitRegistration();
    await flushPromises();

    expect(wrapper.vm.state).toBe('register-success');
    expect(wrapper.text()).toContain('Account Created');
    expect(wrapper.text()).toContain('Please verify your email, then sign in');
  });
});
