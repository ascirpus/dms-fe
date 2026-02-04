import axios, { type AxiosError, type AxiosResponse, HttpStatusCode, type AxiosInstance } from 'axios';
import { useKeycloak } from "@josempgon/vue-keycloak";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";
import { computed } from "vue";

const API_URL = import.meta.env.VITE_DOCUMENT_STORE_URL;

let apiClientInstance: AxiosInstance | null = null;
let interceptorsRegistered = false;

/**
 * Auth composable that handles both direct login (via authStore) and Keycloak SSO
 * Priority: authStore tokens > keycloak tokens
 */
export function useAuth() {
    const authStore = useAuthStore();
    const kc = useKeycloak();
    const kcInstance = kc.keycloak.value;

    // Create axios instance only once
    if (!apiClientInstance) {
        apiClientInstance = axios.create({
            baseURL: API_URL,
        });
    }
    const apiClient = apiClientInstance;

    const decodedToken = computed(() => authStore.decodedToken || kc.decodedToken.value);
    const isAuthenticated = computed(() => authStore.isAuthenticated || kc.isAuthenticated.value);

    // Register interceptors only once
    if (!interceptorsRegistered) {
        interceptorsRegistered = true;

        // Request interceptor: refresh token if needed and add auth header
        apiClient.interceptors.request.use(async config => {
            const store = useAuthStore();
            const keycloak = useKeycloak();

            if (store.accessToken) {
                if (store.isTokenExpired && store.refreshToken) {
                    await store.refreshAccessToken();
                }
            } else if (keycloak.keycloak.value) {
                try {
                    await keycloak.keycloak.value.updateToken(60);
                } catch (err) {
                    console.log("Failed to refresh keycloak token:", err);
                }
            }

            const currentToken = store.accessToken || keycloak.token.value;
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
            return config;
        });

        apiClient.interceptors.response.use(
            (success: AxiosResponse): AxiosResponse => {
                return success;
            },
            (error: AxiosError) => {
                console.log(error);
                const store = useAuthStore();
                const keycloak = useKeycloak();

                // Only logout if we had a token and got 401 (token was rejected)
                // Don't logout if we never had a token (prevents logout during HMR/init)
                if (error.status == HttpStatusCode.Unauthorized) {
                    const hadToken = store.accessToken || keycloak.token.value;
                    if (hadToken) {
                        console.error("[dms-fe] Unauthorized - logging out");
                        store.logout();
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    function login() {
        // Redirect to Keycloak login page
        if (kcInstance) {
            kcInstance.login({
                redirectUri: window.location.origin
            });
        }
    }

    function logout() {
        // Clear authStore tokens
        authStore.logout();

        // Also logout from keycloak if we have a session there
        if (kc.isAuthenticated.value && kcInstance) {
            kcInstance.logout({
                redirectUri: window.location.origin
            });
        } else {
            // Just redirect to home
            window.location.href = '/';
        }
    }

    function getCurrentUser(): User {
        if (!isAuthenticated.value) {
            return {
                name: '',
                email: '',
                picture: '',
            };
        }

        if (authStore.user?.name) {
            return authStore.user;
        }

        const token = decodedToken.value as Record<string, unknown> | null;
        if (!token) {
            return { name: '', email: '', picture: '' };
        }

        // Build name from various possible claims
        const name = (token.name as string) ||
            `${token.given_name || ''} ${token.family_name || ''}`.trim() ||
            (token.preferred_username as string) ||
            '';

        const picture = token.picture as string || '';

        return {
            name,
            email: (token.email as string),
            picture,
        };
    }

    function getInitials(): string {
        const user = getCurrentUser();
        return (user.name ?? '').split(' ').map(word => word[0] || '').join('').toUpperCase();
    }

    return {
        apiClient,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        getInitials,
        decodedToken,
        authStore,
    };
}