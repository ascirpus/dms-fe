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
                beforeEnter: () => {
                    const auth = useAuth();
                    auth.login();
                    return false; // Prevent navigation, Keycloak will redirect
                },
                component: () => import("@/views/user/Login.vue"), // Fallback, won't render
            },
            {
                path: '/password-recovery',
                name: 'password-recovery',
                component: () => import("@/views/user/PasswordRecovery.vue"),
            },
            {
                path: '/complete-setup',
                name: 'complete-setup',
                component: () => import("@/views/user/CompleteAccountSetup.vue"),
            },
            {
                path: '/profile',
                name: 'profile',
                beforeEnter: isAuthenticated(app),
                component: () => import("@/views/user/Profile.vue"),
            },
            {
                path: '/notifications',
                name: 'notifications',
                beforeEnter: isAuthenticated(app),
                component: () => import("@/views/user/Notifications.vue"),
            },
            {
                path: '/projects',
                beforeEnter: isAuthenticated(app),
                children: [
                    {
                        path: '',
                        name: 'projects',
                        component: () => import("@/views/project/ProjectList.vue"),
                    },
                    {
                        path: ':id',
                        name: 'project-details',
                        component: () => import("@/views/project/ProjectDetail.vue"),
                    },
                    {
                        path: ':id/documents/:documentId',
                        name: 'project-document',
                        component: () => import("@/views/project/DocumentViewer.vue"),
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
        document.title = to.meta.title ? `${to.meta.title} - CedarStack` : 'CedarStack - Intelligent Document Hub';
        next()
    })

    return router;
}