// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import { VueQueryPlugin } from "vue-query";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import VuePdf from 'vue3-pdfjs'
import App from './App.vue';
import { createRouter } from './composables/useRoutes.js'
import { i18n, detectLocale } from './plugins/i18n'

// Import PrimeVue core
import PrimeVue from 'primevue/config';
import CedarStack from './theme/cedarstack.js';
import 'primeicons/primeicons.css';
import './style.css';

// Import service components
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { vueKeycloak } from "@josempgon/vue-keycloak";
import { initPostHog } from "./composables/usePostHog.js";

const detectedLocale = detectLocale();
const keycloakLocale = detectedLocale.split('-')[0];

const keycloakConfig = {
    config: {
        url: import.meta.env.VITE_AUTH_PROVIDER,
        realm: import.meta.env.VITE_AUTH_REALM,
        clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
    },
    initOptions: {
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
        locale: keycloakLocale,
    }
}

async function initializeApp() {
    const app = createApp(App);
    const pinia = createPinia();
    pinia.use(piniaPluginPersistedstate);

    // Pinia must be registered before keycloak so authStore is available
    app.use(pinia);

    app.use(i18n);

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
    app.directive('tooltip', Tooltip);

    initPostHog();
    app.mount('#app');
}

initializeApp();
