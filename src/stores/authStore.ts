import { defineStore } from 'pinia'

export type AuthState = {
    error: string,
    permissions: string[],
    tenantId: string | null,
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        error: '',
        permissions: [],
        tenantId: null,
    } as AuthState),

    actions: {
        setTenantId(tenantId: string | null) {
            this.tenantId = tenantId;
        },

        logout() {
            this.permissions = [];
            this.tenantId = null;
            this.error = '';
        },
    },

    persist: {
        storage: localStorage,
        pick: ['tenantId', 'permissions'],
    },
})
