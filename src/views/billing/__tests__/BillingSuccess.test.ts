import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BillingSuccess from '../BillingSuccess.vue';
import { useQueryClient } from 'vue-query';

const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

const mockInvalidateQueries = vi.fn();

vi.mock('vue-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
}));

vi.mock('primevue/button', () => ({
    default: {
        name: 'Button',
        props: ['label', 'icon'],
        template: '<button @click="$emit(\'click\')"><slot /></button>',
    },
}));

describe('BillingSuccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render success message', () => {
        const wrapper = mount(BillingSuccess);

        expect(wrapper.text()).toContain('Payment Successful');
        expect(wrapper.text()).toContain('Your subscription is now active');
    });

    it('should invalidate queries on mount', () => {
        mount(BillingSuccess);

        expect(mockInvalidateQueries).toHaveBeenCalledWith(['tenant']);
        expect(mockInvalidateQueries).toHaveBeenCalledWith(['billingStatus']);
    });

    it('should navigate to workspace overview on button click', async () => {
        const wrapper = mount(BillingSuccess);

        await wrapper.find('button').trigger('click');

        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'workspace-overview' });
    });
});
