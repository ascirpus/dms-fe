import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import DeclineDialog from '../DeclineDialog.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
});

const globalStubs = {
  Dialog: {
    template: '<div v-if="visible" class="dialog-stub"><slot /><slot name="footer" /></div>',
    props: ['visible', 'modal', 'header'],
  },
  Button: {
    template: '<button @click="$emit(\'click\')" :disabled="disabled" :class="{ loading }"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'loading', 'disabled', 'text', 'severity'],
  },
  Textarea: {
    template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'rows'],
  },
};

const globalConfig = { stubs: globalStubs, plugins: [i18n] };

describe('DeclineDialog.vue', () => {
  it('should render when visible', () => {
    const wrapper = mount(DeclineDialog, {
      props: { visible: true, loading: false },
      global: globalConfig,
    });

    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
  });

  it('should not render when not visible', () => {
    const wrapper = mount(DeclineDialog, {
      props: { visible: false, loading: false },
      global: globalConfig,
    });

    expect(wrapper.find('.dialog-stub').exists()).toBe(false);
  });

  it('should emit confirm with comment when confirm button clicked', async () => {
    const wrapper = mount(DeclineDialog, {
      props: { visible: true, loading: false },
      global: globalConfig,
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('Not acceptable quality');

    // The second button is the confirm (first is cancel)
    const buttons = wrapper.findAll('button');
    await buttons[1].trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')![0]).toEqual(['Not acceptable quality']);
  });

  it('should emit confirm with undefined when comment is empty', async () => {
    const wrapper = mount(DeclineDialog, {
      props: { visible: true, loading: false },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    await buttons[1].trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('confirm')![0]).toEqual([undefined]);
  });

  it('should close dialog and clear comment when cancel clicked', async () => {
    const wrapper = mount(DeclineDialog, {
      props: { visible: true, loading: false },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');

    expect(wrapper.emitted('update:visible')).toBeTruthy();
    expect(wrapper.emitted('update:visible')![0]).toEqual([false]);
  });
});
