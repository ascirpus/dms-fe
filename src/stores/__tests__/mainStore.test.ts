import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMainStore } from '../mainStore';

vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    getCurrentUser: vi.fn(() => null),
  })),
}));

describe('mainStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setTheme', () => {
    it('should apply light theme', () => {
      const store = useMainStore();
      store.setTheme('light');

      expect(store.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should apply dark theme', () => {
      const store = useMainStore();
      store.setTheme('dark');

      expect(store.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should resolve auto to dark during night hours', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15, 22, 0, 0));

      const store = useMainStore();
      store.setTheme('auto');

      expect(store.theme).toBe('auto');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      vi.useRealTimers();
    });

    it('should resolve auto to light during day hours', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0));

      const store = useMainStore();
      store.setTheme('auto');

      expect(store.theme).toBe('auto');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      vi.useRealTimers();
    });

    it('should switch from dark to light', () => {
      const store = useMainStore();
      store.setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      store.setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should default to auto', () => {
      const store = useMainStore();
      expect(store.theme).toBe('auto');
    });
  });
});
