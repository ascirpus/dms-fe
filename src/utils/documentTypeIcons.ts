const GOLDEN_ANGLE = 137.508;
const SATURATION = 65;
const LIGHTNESS = 48;

function generateColor(index: number, total: number): string {
  const hue = (index * GOLDEN_ANGLE) % 360;
  return `hsl(${Math.round(hue)}, ${SATURATION}%, ${LIGHTNESS}%)`;
}

export function buildDocumentTypeColorMap(typeIds: string[]): Map<string, string> {
  const sorted = [...typeIds].sort();
  const map = new Map<string, string>();
  sorted.forEach((id, i) => {
    map.set(id, generateColor(i, sorted.length));
  });
  return map;
}

export const ALLOWED_ICONS: readonly string[] = [
  'pi-file', 'pi-file-pdf', 'pi-file-edit', 'pi-file-check', 'pi-file-excel', 'pi-file-word',
  'pi-file-import', 'pi-file-export', 'pi-folder', 'pi-folder-open',
  'pi-book', 'pi-receipt', 'pi-clipboard', 'pi-inbox',
  'pi-image', 'pi-camera', 'pi-chart-bar', 'pi-chart-line',
  'pi-money-bill', 'pi-dollar', 'pi-credit-card', 'pi-wallet',
  'pi-envelope', 'pi-send', 'pi-shield', 'pi-lock',
  'pi-building', 'pi-briefcase', 'pi-wrench', 'pi-cog',
  'pi-users', 'pi-user', 'pi-id-card', 'pi-calendar', 'pi-clock', 'pi-map',
] as const;

const allowedSet = new Set<string>(ALLOWED_ICONS);

export const DEFAULT_ICON = 'pi-file';

export function sanitizeIcon(icon: unknown): string {
  if (typeof icon === 'string' && allowedSet.has(icon)) {
    return icon;
  }
  return DEFAULT_ICON;
}
