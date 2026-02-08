import { acceptHMRUpdate, defineStore } from 'pinia';
import type { ThemeMode, User } from "@/types";
import { type Ref, ref } from "vue";
import { useAuth } from "@/composables/useAuth.ts";

interface RootState {
    theme: ThemeMode,
    sidebarVisible: Ref<boolean>,
    documentMarker: boolean,

    user: User | null,

    setTheme: (theme: ThemeMode) => void,
    setSidebarState: (state: boolean) => void,
    toggleDocumentMarker: (state: boolean) => void,
}

let mediaQuery: MediaQueryList | null = null;
let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

function resolveAutoTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyResolvedTheme(resolved: 'light' | 'dark') {
    const html = document.documentElement;
    html.setAttribute('data-theme', resolved);

    if (resolved === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

export const useMainStore = defineStore('main', {
    state: (): RootState => {
        const userAuth = useAuth();

        return {
            user: userAuth.getCurrentUser(),
            theme: 'auto',
            sidebarVisible: ref(true),
            documentMarker: false,

            setSidebarState(state: boolean) {},
            setTheme(theme: ThemeMode) {},
            toggleDocumentMarker(state: boolean) {},
        }
    },

    actions: {
        setSidebarState(state: boolean) {
            this.sidebarVisible = state;
        },

        toggleDocumentMarker(state: boolean) {
            this.documentMarker = state;
        },

        setTheme(mode: ThemeMode) {
            this.theme = mode;

            if (mediaQuery && mediaHandler) {
                mediaQuery.removeEventListener('change', mediaHandler);
                mediaHandler = null;
                mediaQuery = null;
            }

            if (mode === 'auto') {
                applyResolvedTheme(resolveAutoTheme());
                mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                mediaHandler = (e) => applyResolvedTheme(e.matches ? 'dark' : 'light');
                mediaQuery.addEventListener('change', mediaHandler);
            } else {
                applyResolvedTheme(mode);
            }
        },
    },
    persist: true,

})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMainStore, import.meta.hot))
}
