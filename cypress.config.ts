import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://dms.internal:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    chromeWebSecurity: false, // Needed for local dev with self-signed certs
    video: false,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  env: {
    // API base URL
    apiUrl: 'http://api.dms.internal:8080',
    // Keycloak auth
    authUrl: 'http://auth.dms.internal:8083',
  },
});
