import axios, { type AxiosError, type AxiosResponse, HttpStatusCode, type AxiosInstance } from 'axios';
import { useKeycloak } from "@josempgon/vue-keycloak";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";
import type { UserTenantsResponse } from "@/types/Tenant";
import { computed, ref } from "vue";

const API_URL = import.meta.env.VITE_DOCUMENT_STORE_URL;

let apiClientInstance: AxiosInstance | null = null;
let interceptorsRegistered = false;
let refreshPromise: Promise<string | null> | null = null;
let tenantInitPromise: Promise<string | null> | null = null;

const tenantReady = ref(false);
const currentUser = ref<User | null>(null);

async function refreshToken(): Promise<string | null> {
    const keycloak = useKeycloak();

    if (keycloak.keycloak.value) {
        try {
            await keycloak.keycloak.value.updateToken(60);
            return keycloak.keycloak.value.token ?? null;
        } catch {
            return null;
        }
    }

    return null;
}

async function getRefreshedToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = refreshToken().finally(() => {
        refreshPromise = null;
    });
    return refreshPromise;
}

export function useAuth() {
    const authStore = useAuthStore();
    const kc = useKeycloak();

    if (!apiClientInstance) {
        apiClientInstance = axios.create({
            baseURL: API_URL,
        });
    }
    const apiClient = apiClientInstance;

    const decodedToken = computed(() => kc.decodedToken.value);
    const isAuthenticated = computed(() => kc.isAuthenticated.value);

    const getCurrentTenantId = (): string | null => {
        return authStore.tenantId;
    };

    if (!interceptorsRegistered) {
        interceptorsRegistered = true;

        apiClient.interceptors.request.use(async config => {
            const currentToken = await getRefreshedToken();
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }

            const url = config.url ?? '';
            const isTenantBootstrap = url === '/api/tenants' || url === '/api/me';
            if (!isTenantBootstrap) {
                const tenantId = authStore.tenantId;
                if (tenantId) {
                    config.headers['X-Tenant-ID'] = tenantId;
                }
            }

            return config;
        });

        apiClient.interceptors.response.use(
            (success: AxiosResponse): AxiosResponse => {
                return success;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as typeof error.config & { _retry?: boolean };

                if (error.status === HttpStatusCode.Unauthorized && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const freshToken = await getRefreshedToken();
                    if (freshToken) {
                        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                        return apiClient(originalRequest);
                    }

                    const store = useAuthStore();
                    console.error("[dms-fe] Unauthorized - token refresh failed, logging out");
                    store.cleanStorage();

                    window.location.href = '/login';
                }

                return Promise.reject(error);
            }
        );
    }

    async function fetchCurrentUser(): Promise<User | null> {
        try {
            const response = await apiClient.get<{ status: string; data: User }>('/api/me');
            currentUser.value = response.data.data;
            return currentUser.value;
        } catch (e) {
            console.error('[dms-fe] Failed to fetch current user:', e);
            return null;
        }
    }

    async function updateProfile(data: { firstName?: string; lastName?: string; phone?: string; locale?: string; themePreference?: string }): Promise<User | null> {
        try {
            const response = await apiClient.put<{ status: string; data: User }>('/api/me', data);
            currentUser.value = response.data.data;
            return currentUser.value;
        } catch (e) {
            console.error('[dms-fe] Failed to update profile:', e);
            throw e;
        }
    }

    async function initializeTenant(): Promise<string | null> {
        if (authStore.tenantId) {
            tenantReady.value = true;
            return authStore.tenantId;
        }

        if (tenantInitPromise) return tenantInitPromise;

        tenantInitPromise = (async () => {
            try {
                const response = await apiClient.get<{ status: string; data: UserTenantsResponse }>('/api/tenants');
                const { tenants, lastAccessedTenantId } = response.data.data;

                if (!tenants || tenants.length === 0) {
                    console.warn('[dms-fe] User has no tenants');
                    return null;
                }

                let selectedId: string;
                if (lastAccessedTenantId && tenants.some(t => t.tenantId === lastAccessedTenantId)) {
                    selectedId = lastAccessedTenantId;
                } else {
                    selectedId = tenants[0].tenantId;
                }

                authStore.setTenantId(selectedId);
                tenantReady.value = true;

                return selectedId;
            } catch (e) {
                console.error('[dms-fe] Failed to fetch user tenants:', e);
                return null;
            } finally {
                tenantInitPromise = null;
            }
        })();

        return tenantInitPromise;
    }

    async function selectTenant(tenantId: string): Promise<void> {
        authStore.setTenantId(tenantId);
        try {
            await apiClient.put('/api/me/active-tenant', { tenantId });
        } catch (e) {
            console.warn('[dms-fe] Failed to notify backend of tenant selection:', e);
        }
    }

    function login(redirectUri?: string) {
        authStore.cleanStorage();
        const kcInstance = kc.keycloak.value;
        if (kcInstance) {
            kcInstance.login({
                redirectUri: redirectUri ?? window.location.origin + '/app/projects'
            });
        }
    }

    function logout() {
        authStore.cleanStorage();
        tenantReady.value = false;
        currentUser.value = null;

        const kcInstance = kc.keycloak.value;
        if (kcInstance) {
            kcInstance.logout({
                redirectUri: window.location.origin
            });
        } else {
            window.location.href = '/';
        }
    }

    function getCurrentUser(): User | null {
        return currentUser.value;
    }

    return {
        apiClient,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        getCurrentTenantId,
        initializeTenant,
        selectTenant,
        tenantReady,
        decodedToken,
        currentUser,
        fetchCurrentUser,
        updateProfile,
    };
}
