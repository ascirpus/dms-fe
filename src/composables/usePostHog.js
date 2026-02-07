import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
    if (initialized) return
    initialized = true

    posthog.init('phc_v0s2BXdYwJZ53ZV7982bA6NUlOsFXqT7o5Oz35UyiS8', {
        api_host: 'https://ph.cedar-stack.com',
        ui_host: 'https://eu.posthog.com'
    })
}

export function usePostHog() {
    return posthog
}
