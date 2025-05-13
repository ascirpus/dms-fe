import axios, { type AxiosError, type AxiosResponse, HttpStatusCode } from 'axios';
import { useKeycloak } from "@josempgon/vue-keycloak";
import type { User } from "@/types";
import { computed } from "vue";

const API_URL = import.meta.env.VITE_DOCUMENT_STORE_URL;

export function useAuth() {
    const kc = useKeycloak();
    const kcInstance = kc.keycloak.value;
    const token = kc.token.value;
    const apiClient = axios.create({
        baseURL: API_URL,
    });

    const decodedToken = computed(() => kc.decodedToken.value);
    const isAuthenticated = computed(() => kc.isAuthenticated.value);

    apiClient.interceptors.request.use(config => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    apiClient.interceptors.response.use(
        (success: AxiosResponse): AxiosResponse => {
            return success
        },
        (error: AxiosError) => {
            if (error.status == HttpStatusCode.Unauthorized) {
                console.error("[dms-fe] User not found in API backend database");
                console.debug("Log the user out and redirect to /login")
            }
            return Promise.reject(error);
        }
    )

    function login() {
        kcInstance?.login();
    }

    function logout() {

        kcInstance?.logout({
            redirectUri: window.location.origin
        });
    }

    function getCurrentUser() {
        if (!isAuthenticated.value) {
            return {
                name: '',
                email: '',
                avatar: '',
            }
        }

        return {
            name: decodedToken.value?.name,
            email: decodedToken.value?.email,
            avatar: decodedToken.value?.avatar,
        } as User
    }

    function getInitials(): string {
        return (decodedToken.value?.name ?? '').split(' ').map(word => word[0] || '').join('').toUpperCase()
    }

    return {
        apiClient,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        getInitials,
        decodedToken,
    };
}