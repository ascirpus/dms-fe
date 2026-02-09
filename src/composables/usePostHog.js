import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
    if (initialized) return
    initialized = true

    if (process.env.NODE_ENV !== 'development') {
        posthog.init('phc_v0s2BXdYwJZ53ZV7982bA6NUlOsFXqT7o5Oz35UyiS8', {
            api_host: 'https://ph.cedar-stack.com',
            ui_host: 'https://eu.posthog.com',
            persistence: 'memory',
        })
    }
}

export function usePostHog() {
    return posthog
}
