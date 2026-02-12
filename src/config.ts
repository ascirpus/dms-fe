/**
 * Runtime configuration with fallback to Vite build-time env vars.
 *
 * In development: Vite injects import.meta.env.VITE_* at build time.
 * In Docker:      docker-entrypoint.sh generates /runtime-config.js with
 *                 window.__RUNTIME_CONFIG__ from environment variables,
 *                 which takes precedence over the baked-in values.
 */

interface RuntimeConfig {
    API_URL?: string
    AUTH_URL?: string
    AUTH_REALM?: string
    AUTH_CLIENT_ID?: string
    TURNSTILE_SITE_KEY?: string
}

declare global {
    interface Window {
        __RUNTIME_CONFIG__?: RuntimeConfig
    }
}

const rc = window.__RUNTIME_CONFIG__ || {}

export const config = {
    apiUrl: rc.API_URL || import.meta.env.VITE_DOCUMENT_STORE_URL,
    authUrl: rc.AUTH_URL || import.meta.env.VITE_AUTH_PROVIDER,
    authRealm: rc.AUTH_REALM || import.meta.env.VITE_AUTH_REALM,
    authClientId: rc.AUTH_CLIENT_ID || import.meta.env.VITE_AUTH_CLIENT_ID,
    turnstileSiteKey: rc.TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY,
} as const
