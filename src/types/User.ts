export interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    locale?: string;
    picture?: string;
    themePreference?: ThemeMode;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
