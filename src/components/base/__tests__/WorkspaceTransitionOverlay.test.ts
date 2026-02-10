import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import WorkspaceTransitionOverlay from '../WorkspaceTransitionOverlay.vue';

const mockIsSwitching = ref(false);
const mockSwitchingToName = ref('');

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: () => ({
    isSwitching: mockIsSwitching,
    switchingToName: mockSwitchingToName,
  }),
}));

const globalStubs = {
  ProgressSpinner: {
    template: '<div class="spinner-stub"></div>',
  },
};

describe('WorkspaceTransitionOverlay.vue', () => {
  beforeEach(() => {
    mockIsSwitching.value = false;
    mockSwitchingToName.value = '';
  });

  it('should not render overlay when not switching', () => {
    const wrapper = mount(WorkspaceTransitionOverlay, {
      global: {
        stubs: {
          ...globalStubs,
          Teleport: true,
        },
      },
    });

    expect(wrapper.find('.workspace-overlay').exists()).toBe(false);
  });

  it('should render overlay when switching', async () => {
    mockIsSwitching.value = true;
    mockSwitchingToName.value = 'My Workspace';

    const wrapper = mount(WorkspaceTransitionOverlay, {
      global: {
        stubs: {
          ...globalStubs,
          Teleport: true,
        },
      },
    });

    expect(wrapper.find('.workspace-overlay').exists()).toBe(true);
    expect(wrapper.text()).toContain('Switching to My Workspace...');
  });

  it('should show fallback text when workspace name is empty', async () => {
    mockIsSwitching.value = true;
    mockSwitchingToName.value = '';

    const wrapper = mount(WorkspaceTransitionOverlay, {
      global: {
        stubs: {
          ...globalStubs,
          Teleport: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Switching to workspace...');
  });

  it('should hide overlay when switching completes', async () => {
    mockIsSwitching.value = true;
    mockSwitchingToName.value = 'Target WS';

    const wrapper = mount(WorkspaceTransitionOverlay, {
      global: {
        stubs: {
          ...globalStubs,
          Teleport: true,
        },
      },
    });

    expect(wrapper.find('.workspace-overlay').exists()).toBe(true);

    mockIsSwitching.value = false;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.workspace-overlay').exists()).toBe(false);
  });
});
