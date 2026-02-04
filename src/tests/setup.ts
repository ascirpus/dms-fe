import { vi } from 'vitest';

global.CSS = {
  supports: () => false,
  escape: (str: string) => str,
} as any;
