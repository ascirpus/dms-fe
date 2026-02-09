import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BillingCancel from '../BillingCancel.vue';

const mockRouterPush = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

vi.mock('primevue/button', () => ({
    default: {
        name: 'Button',
        props: ['label', 'icon', 'severity', 'text'],
        template: '<button @click="$emit(\'click\')"><slot /></button>',
    },
}));

describe('BillingCancel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render cancel message', () => {
        const wrapper = mount(BillingCancel);

        expect(wrapper.text()).toContain('Payment Cancelled');
        expect(wrapper.text()).toContain('No charges were made');
    });

    it('should navigate to workspace overview on "Try Again" click', async () => {
        const wrapper = mount(BillingCancel);
        const buttons = wrapper.findAll('button');

        await buttons[0].trigger('click');

        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'workspace-overview' });
    });

    it('should navigate to projects on "Go to Projects" click', async () => {
        const wrapper = mount(BillingCancel);
        const buttons = wrapper.findAll('button');

        await buttons[1].trigger('click');

        expect(mockRouterPush).toHaveBeenCalledWith({ name: 'projects' });
    });
});
