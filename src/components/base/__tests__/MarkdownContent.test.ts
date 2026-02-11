import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MarkdownContent from '../MarkdownContent.vue';

describe('MarkdownContent.vue', () => {
  it('renders markdown as HTML', () => {
    const wrapper = mount(MarkdownContent, {
      props: { source: '# Hello\n\nWorld' },
    });

    expect(wrapper.find('h1').text()).toBe('Hello');
    expect(wrapper.find('p').text()).toBe('World');
  });

  it('renders links from markdown', () => {
    const wrapper = mount(MarkdownContent, {
      props: { source: '[Click](https://example.com)' },
    });

    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('https://example.com');
    expect(link.text()).toBe('Click');
  });

  it('renders lists from markdown', () => {
    const wrapper = mount(MarkdownContent, {
      props: { source: '- Item 1\n- Item 2' },
    });

    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toBe('Item 1');
  });

  it('applies prose-legal class to wrapper', () => {
    const wrapper = mount(MarkdownContent, {
      props: { source: 'test' },
    });

    expect(wrapper.find('.prose-legal').exists()).toBe(true);
  });

  it('reacts to source prop changes', async () => {
    const wrapper = mount(MarkdownContent, {
      props: { source: '# First' },
    });

    expect(wrapper.find('h1').text()).toBe('First');

    await wrapper.setProps({ source: '# Second' });
    expect(wrapper.find('h1').text()).toBe('Second');
  });
});
