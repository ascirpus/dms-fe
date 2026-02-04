import { defineStore } from 'pinia'
import type { User } from '@/types/User';
import { jwtDecode, type JwtPayload } from "jwt-decode";

interface TokenPayload extends JwtPayload {
    name?: string;
    email?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    permissions?: string[];
}

export type AuthState = {
    user: User | null,
    error: string,
    accessToken: string | null,
    refreshToken: string | null,
    idToken: string | null,
    permissions: string[],
    tokenExpiry: number | null,
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        error: '',
        accessToken: null,
        refreshToken: null,
        idToken: null,
        permissions: [],
        tokenExpiry: null,
    } as AuthState),

    getters: {
        email: (state: AuthState): string => state.user?.email ?? '',
        name: (state: AuthState): string => state.user?.name ?? '',
        picture: (state: AuthState): string => state.user?.picture ?? '',
        isTokenExpired: (state: AuthState): boolean => {
            if (!state.tokenExpiry) return true;
            // Add 10 second buffer
            return Date.now() >= (state.tokenExpiry - 10000);
        },
        isAuthenticated(): boolean {
            return !!this.accessToken && !this.isTokenExpired;
        },
        initials: (state: AuthState): string => (state.user?.name ?? '').split(' ').map(word => word[0] || '').join('').toUpperCase(),
        decodedToken: (state: AuthState): TokenPayload | null => {
            if (!state.accessToken) return null;
            try {
                return jwtDecode<TokenPayload>(state.accessToken);
            } catch {
                return null;
            }
        },
    },

    actions: {
        setTokens(accessToken: string, refreshToken: string, idToken: string) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.idToken = idToken;

            try {
                const decoded = jwtDecode<TokenPayload>(accessToken);
                this.tokenExpiry = decoded.exp ? decoded.exp * 1000 : null;
                this.permissions = decoded.permissions || [];

                this.user = {
                    email: decoded.email || decoded.preferred_username || '',
                    name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
                    picture: decoded.picture || '',
                };
            } catch (err) {
                console.error('[authStore] Failed to decode token:', err);
                this.error = 'Failed to decode authentication token';
            }
        },

        async refreshAccessToken(): Promise<boolean> {
            if (!this.refreshToken) {
                console.log('[authStore] No refresh token available');
                return false;
            }

            try {
                const tokenUrl = `${import.meta.env.VITE_AUTH_PROVIDER}/realms/${import.meta.env.VITE_AUTH_REALM}/protocol/openid-connect/token`;

                const params = new URLSearchParams();
                params.append('grant_type', 'refresh_token');
                params.append('client_id', import.meta.env.VITE_AUTH_CLIENT_ID);
                params.append('refresh_token', this.refreshToken);

                const response = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params,
                });

                if (response.ok) {
                    const tokens = await response.json();
                    this.setTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
                    console.log('[authStore] Token refreshed successfully');
                    return true;
                } else {
                    console.error('[authStore] Token refresh failed:', await response.text());
                    this.logout();
                    return false;
                }
            } catch (err) {
                console.error('[authStore] Token refresh error:', err);
                this.logout();
                return false;
            }
        },

        logout() {
            this.user = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.idToken = null;
            this.permissions = [];
            this.tokenExpiry = null;
            this.error = '';
        },
    },

    persist: {
        storage: localStorage,
        pick: ['accessToken', 'refreshToken', 'idToken', 'user', 'tokenExpiry', 'permissions'],
    },
})
