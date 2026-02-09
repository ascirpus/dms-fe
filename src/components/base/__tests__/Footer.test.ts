import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from '../Footer.vue';

const globalStubs = {
  'router-link': {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
};

function mountFooter() {
  return mount(Footer, { global: { stubs: globalStubs } });
}

describe('Footer.vue', () => {
  it('should render Terms of Service link pointing to /terms', () => {
    const wrapper = mountFooter();

    const links = wrapper.findAll('a');
    const termsLink = links.find(l => l.text() === 'Terms of Service');
    expect(termsLink).toBeDefined();
    expect(termsLink!.attributes('href')).toBe('/terms');
  });

  it('should render Privacy Policy link pointing to /privacy', () => {
    const wrapper = mountFooter();

    const links = wrapper.findAll('a');
    const privacyLink = links.find(l => l.text() === 'Privacy Policy');
    expect(privacyLink).toBeDefined();
    expect(privacyLink!.attributes('href')).toBe('/privacy');
  });

  it('should render contact email as mailto link', () => {
    const wrapper = mountFooter();

    const mailtoLink = wrapper.find('a[href="mailto:support@cedar-stack.com"]');
    expect(mailtoLink.exists()).toBe(true);
    expect(mailtoLink.text()).toBe('support@cedar-stack.com');
  });
});
