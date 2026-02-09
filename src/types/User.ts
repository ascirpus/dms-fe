import type { NotificationPreferences } from './Notification';

export interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    locale?: string;
    picture?: string;
    themePreference?: ThemeMode;
    notificationOverrides?: NotificationPreferences;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type DocumentViewMode = 'tiles' | 'table';
