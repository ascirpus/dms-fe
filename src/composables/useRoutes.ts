import { createRouter as createVueRouter, createWebHistory, type Router } from 'vue-router';
import type { App } from "vue"
import { useAuth } from "@/composables/useAuth.ts";

const isAuthenticated = (app: App) => {
    return (to, from) => {
        const auth = useAuth()

        return auth.isAuthenticated.value ? true : { name:  "login" }
    }
}

export function createRouter(app: App): Router {
    const router = createVueRouter({
        history: createWebHistory(),
        routes: [
            {
                path: '/',
                name: 'home',
                component: () => import("@/views/HomeView.vue"),
                meta: {
                    title: 'Home',
                    description: 'Welcome to the PDF Marker App. Here you can upload and annotate your PDF documents.',
                    icon: 'pi pi-home'
                }
            },
            {
                path: '/login',
                name: 'login',
                component: () => import("@/views/user/Login.vue"),
            },
            {
                path: '/profile',
                name: 'profile',
                beforeEnter: isAuthenticated(app),
                component: () => import("@/views/user/Profile.vue"),
            },
            {
                path: '/documents',
                meta: {
                    title: 'Documents',
                    description: 'View and manage your uploaded documents.',
                    icon: 'pi pi-folder'
                },
                beforeEnter: isAuthenticated(app),
                children: [
                    {
                        path: '',
                        name: 'document',
                        component: () => import('@/views/document/TableView.vue'),
                    },
                    {
                        path: ':id',
                        name: 'document-viewer',
                        component: () => import('@/views/document/OneDocument.vue'),
                        props: route => ({ documentId: route.params.id }),
                    }
                ]
            },
            {
                path: '/:pathMatch(.*)*',
                name: 'not-found',
                component: () => import('@/views/NotFoundView.vue'),
                meta: {
                    title: '404 Not Found',
                    description: 'The page you are looking for does not exist.',
                    icon: 'pi pi-exclamation-triangle'
                }
            }
        ]
    });

    router.beforeEach((to, from, next) => {
        document.title = to.meta.title ? `${to.meta.title} - PDF Marker App` : 'PDF Marker App'
        next()
    })

    return router;
}