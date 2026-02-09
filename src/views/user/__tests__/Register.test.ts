import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { AxiosError } from 'axios';
import Register from '../Register.vue';

const mockPush = vi.fn();
const mockRegisterCompany = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockPush }),
    useRoute: () => ({ query: {} }),
}));

vi.mock('@/services/RegistrationService', () => ({
    RegistrationService: class {
        registerCompany = mockRegisterCompany;
    },
}));

const globalStubs = {
    Logo: { template: '<div class="logo" />' },
    Button: {
        template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot>{{ label }}</slot></button>',
        props: ['label', 'disabled', 'loading', 'link', 'type'],
    },
    InputText: {
        template: '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keypress="$emit(\'keypress\', $event)" />',
        props: ['modelValue', 'type', 'placeholder', 'id'],
    },
    Message: {
        template: '<div class="p-message" role="alert"><slot /></div>',
        props: ['severity', 'closable'],
    },
};

let turnstileRenderCallback: ((token: string) => void) | null = null;
const mockTurnstileReset = vi.fn();
const mockTurnstileRemove = vi.fn();

function defaultTurnstileRender(el: HTMLElement, options: any) {
    turnstileRenderCallback = options.callback;
    turnstileRenderCallback?.('test-captcha-token');
    return 'widget-id-123';
}

describe('Register.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        turnstileRenderCallback = null;
        (window as any).turnstile = {
            render: vi.fn(defaultTurnstileRender),
            reset: mockTurnstileReset,
            remove: mockTurnstileRemove,
        };
    });

    afterEach(() => {
        delete (window as any).turnstile;
    });

    function mountRegister() {
        return mount(Register, { global: { stubs: globalStubs } });
    }

    it('should render the form with all fields', () => {
        const wrapper = mountRegister();

        expect(wrapper.text()).toContain('Create Account');
        expect(wrapper.find('#email').exists()).toBe(true);
        expect(wrapper.find('#companyName').exists()).toBe(true);
        expect(wrapper.find('#firstName').exists()).toBe(true);
        expect(wrapper.find('#lastName').exists()).toBe(true);
    });

    it('should render the Turnstile container', () => {
        const wrapper = mountRegister();
        expect(wrapper.find('[data-testid="turnstile-container"]').exists()).toBe(true);
    });

    it('should render the Turnstile widget on mount', () => {
        mountRegister();
        const renderMock = (window as any).turnstile.render;
        expect(renderMock).toHaveBeenCalledOnce();
        expect(renderMock).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            expect.objectContaining({
                sitekey: expect.any(String),
                callback: expect.any(Function),
                'error-callback': expect.any(Function),
                'expired-callback': expect.any(Function),
                theme: expect.stringMatching(/^(light|dark)$/),
            }),
        );
    });

    it('should disable submit when required fields are empty', () => {
        const wrapper = mountRegister();
        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');

        expect(submitButton?.attributes('disabled')).toBeDefined();
    });

    it('should disable submit without captcha token even with valid fields', async () => {
        (window as any).turnstile.render = vi.fn(() => 'widget-id-123');

        const wrapper = mountRegister();

        await wrapper.find('#email').setValue('test@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        expect(submitButton?.attributes('disabled')).toBeDefined();
    });

    it('should enable submit with valid email, workspace name, and captcha token', async () => {
        const wrapper = mountRegister();
        await flushPromises();

        await wrapper.find('#email').setValue('test@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        expect(submitButton?.attributes('disabled')).toBeUndefined();
    });

    it('should include captchaToken in registration request', async () => {
        mockRegisterCompany.mockResolvedValue({
            user: { id: 'u1', email: 'test@example.com', firstName: '', lastName: '' },
            tenantId: 't1',
        });

        const wrapper = mountRegister();
        await flushPromises();

        await wrapper.find('#email').setValue('test@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(mockRegisterCompany).toHaveBeenCalledWith({
            email: 'test@example.com',
            companyName: 'Acme Corp',
            firstName: undefined,
            lastName: undefined,
            captchaToken: 'test-captcha-token',
        });
    });

    it('should show confirmation state after successful submission', async () => {
        mockRegisterCompany.mockResolvedValue({
            user: { id: 'u1', email: 'test@example.com', firstName: '', lastName: '' },
            tenantId: 't1',
        });

        const wrapper = mountRegister();
        await flushPromises();

        await wrapper.find('#email').setValue('test@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('test@example.com');
        expect(wrapper.text()).toContain('verification link');
        expect(wrapper.text()).toContain('Continue to Sign In');
    });

    it('should reset Turnstile widget on submission error', async () => {
        const axiosError = new AxiosError('Server error', '500', undefined, undefined, {
            status: 500,
            data: { status: 'ERROR', error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
            statusText: 'Internal Server Error',
            headers: {},
            config: {} as any,
        });
        mockRegisterCompany.mockRejectedValue(axiosError);

        const wrapper = mountRegister();
        await flushPromises();

        await wrapper.find('#email').setValue('test@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(mockTurnstileReset).toHaveBeenCalledWith('widget-id-123');
    });

    it('should display error message for USER_ALREADY_EXISTS', async () => {
        const axiosError = new AxiosError('Conflict', '409', undefined, undefined, {
            status: 409,
            data: { status: 'ERROR', error: { code: 'USER_ALREADY_EXISTS', message: 'User already exists' } },
            statusText: 'Conflict',
            headers: {},
            config: {} as any,
        });
        mockRegisterCompany.mockRejectedValue(axiosError);

        const wrapper = mountRegister();
        await flushPromises();

        await wrapper.find('#email').setValue('existing@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        await submitButton?.trigger('click');
        await flushPromises();

        expect(wrapper.text()).toContain('An account with this email already exists');
        expect(mockTurnstileReset).toHaveBeenCalledWith('widget-id-123');
    });

    it('should remove Turnstile widget on unmount', () => {
        const wrapper = mountRegister();
        wrapper.unmount();
        expect(mockTurnstileRemove).toHaveBeenCalledWith('widget-id-123');
    });

    it('should navigate to login when "Already have an account?" is clicked', async () => {
        const wrapper = mountRegister();

        const loginButton = wrapper.findAll('button').find(b => b.text() === 'Already have an account?');
        await loginButton?.trigger('click');

        expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
    });

    it('should navigate to login from confirmation state', async () => {
        mockRegisterCompany.mockResolvedValue({
            user: { id: 'u1', email: 'test@example.com', firstName: '', lastName: '' },
            tenantId: 't1',
        });

        const wrapper = mountRegister();
        await flushPromises();

        await wrapper.find('#email').setValue('test@example.com');
        await wrapper.find('#companyName').setValue('Acme Corp');
        await flushPromises();

        const submitButton = wrapper.findAll('button').find(b => b.text() === 'Create Account');
        await submitButton?.trigger('click');
        await flushPromises();

        const continueButton = wrapper.findAll('button').find(b => b.text() === 'Continue to Sign In');
        await continueButton?.trigger('click');

        expect(mockPush).toHaveBeenCalledWith({ name: 'login' });
    });
});
