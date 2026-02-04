// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import { VueQueryPlugin } from "vue-query";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import VuePdf from 'vue3-pdfjs'
import App from './App.vue';
import { createRouter } from './composables/useRoutes.js'

// Import PrimeVue core
import PrimeVue from 'primevue/config';
import CedarStack from './theme/cedarstack.js';
import 'primeicons/primeicons.css';
import './style.css';

// Import service components
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import { vueKeycloak } from "@josempgon/vue-keycloak";

const keycloakConfig = {
    config: {
        url: import.meta.env.VITE_AUTH_PROVIDER,
        realm: import.meta.env.VITE_AUTH_REALM,
        clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    },
    initOptions: {
        onLoad: "check-sso",
        checkLoginIframe: false,
    }
}

async function initializeApp() {
    const app = createApp(App);
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);

    // Pinia must be registered before keycloak so authStore is available
    app.use(pinia);

    await vueKeycloak.install(app, keycloakConfig);
    app.use(createRouter(app));
    app.use(VueQueryPlugin);

    app.use(PrimeVue, {
        ripple: true,
        theme: {
            preset: CedarStack,
            options: {
                darkModeSelector: 'html.dark',
                cssLayer: {
                    name: 'primevue',
                    order: 'tailwind-base, primevue, tailwind-utilities'
                }
            }
        }
    });

    app.use(VuePdf);
    app.use(ToastService);
    app.use(ConfirmationService);

    app.mount('#app');
}

initializeApp();
