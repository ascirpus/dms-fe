import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { AxiosError } from 'axios';
import ProfileSecurity from '../ProfileSecurity.vue';

const mockChangePassword = vi.fn();

vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        changePassword: mockChangePassword,
    }),
}));

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
        en: {
            profileSecurity: {
                title: 'Change Password',
                currentPassword: 'Current Password',
                currentPasswordPlaceholder: 'Enter current password',
                newPassword: 'New Password',
                newPasswordPlaceholder: 'Enter new password',
                confirmNewPassword: 'Confirm New Password',
                confirmNewPasswordPlaceholder: 'Confirm new password',
                passwordTooShort: 'Password must be at least 8 characters',
                passwordsDoNotMatch: 'Passwords do not match',
                changePassword: 'Change Password',
                passwordChanged: 'Your password has been changed successfully.',
                incorrectCurrentPassword: 'Current password is incorrect.',
                changeFailed: 'Failed to change password. Please try again.',
            },
        },
    },
    missingWarn: false,
    fallbackWarn: false,
});

const globalStubs = {
    Password: {
        template: '<input :id="id" type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        props: ['modelValue', 'placeholder', 'id', 'feedback', 'toggleMask', 'inputClass', 'invalid'],
    },
    Button: {
        template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot>{{ label }}</slot></button>',
        props: ['label', 'disabled', 'loading', 'type'],
    },
    Message: {
        template: '<div class="p-message" role="alert"><slot /></div>',
        props: ['severity', 'closable'],
    },
};

describe('ProfileSecurity.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function mountComponent() {
        return mount(ProfileSecurity, { global: { stubs: globalStubs, plugins: [i18n] } });
    }

    async function fillForm(wrapper: ReturnType<typeof mountComponent>, current = 'oldpass123', newPass = 'newpass123') {
        await wrapper.find('#currentPassword').setValue(current);
        await wrapper.find('#newPassword').setValue(newPass);
        await wrapper.find('#confirmNewPassword').setValue(newPass);
        await flushPromises();
    }

    it('should render all password fields', () => {
        const wrapper = mountComponent();

        expect(wrapper.text()).toContain('Change Password');
        expect(wrapper.find('#currentPassword').exists()).toBe(true);
        expect(wrapper.find('#newPassword').exists()).toBe(true);
        expect(wrapper.find('#confirmNewPassword').exists()).toBe(true);
    });

    it('should disable submit when form is empty', () => {
        const wrapper = mountComponent();
        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');

        expect(submitButton?.attributes('disabled')).toBeDefined();
    });

    it('should disable submit when new password is too short', async () => {
        const wrapper = mountComponent();

        await wrapper.find('#currentPassword').setValue('oldpass123');
        await wrapper.find('#newPassword').setValue('short');
        await wrapper.find('#confirmNewPassword').setValue('short');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        expect(submitButton?.attributes('disabled')).toBeDefined();
    });

    it('should show password too short hint', async () => {
        const wrapper = mountComponent();

        await wrapper.find('#newPassword').setValue('short');
        await flushPromises();

        expect(wrapper.text()).toContain('Password must be at least 8 characters');
    });

    it('should disable submit when passwords do not match', async () => {
        const wrapper = mountComponent();

        await wrapper.find('#currentPassword').setValue('oldpass123');
        await wrapper.find('#newPassword').setValue('newpass123');
        await wrapper.find('#confirmNewPassword').setValue('different');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        expect(submitButton?.attributes('disabled')).toBeDefined();
    });

    it('should show passwords do not match hint', async () => {
        const wrapper = mountComponent();

        await wrapper.find('#newPassword').setValue('newpass123');
        await wrapper.find('#confirmNewPassword').setValue('different');
        await flushPromises();

        expect(wrapper.text()).toContain('Passwords do not match');
    });

    it('should enable submit with valid form', async () => {
        const wrapper = mountComponent();

        await fillForm(wrapper);

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        expect(submitButton?.attributes('disabled')).toBeUndefined();
    });

    it('should call changePassword with correct arguments on submit', async () => {
        mockChangePassword.mockResolvedValue(undefined);

        const wrapper = mountComponent();
        await fillForm(wrapper, 'myoldpass', 'mynewpass');

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(mockChangePassword).toHaveBeenCalledWith('myoldpass', 'mynewpass');
    });

    it('should show success message and reset form after successful change', async () => {
        mockChangePassword.mockResolvedValue(undefined);

        const wrapper = mountComponent();
        await fillForm(wrapper);

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Your password has been changed successfully.');
        expect((wrapper.find('#currentPassword').element as HTMLInputElement).value).toBe('');
        expect((wrapper.find('#newPassword').element as HTMLInputElement).value).toBe('');
        expect((wrapper.find('#confirmNewPassword').element as HTMLInputElement).value).toBe('');
    });

    it('should show error message when current password is incorrect', async () => {
        const axiosError = new AxiosError('Bad Request', '400', undefined, undefined, {
            status: 400,
            data: { status: 'ERROR', error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } },
            statusText: 'Bad Request',
            headers: {},
            config: {} as any,
        });
        mockChangePassword.mockRejectedValue(axiosError);

        const wrapper = mountComponent();
        await fillForm(wrapper);

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Current password is incorrect.');
    });

    it('should show generic error message on other failures', async () => {
        mockChangePassword.mockRejectedValue(new Error('Network Error'));

        const wrapper = mountComponent();
        await fillForm(wrapper);

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Change Password');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('Failed to change password. Please try again.');
    });
});
