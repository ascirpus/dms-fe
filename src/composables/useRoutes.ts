import { createRouter as createVueRouter, createWebHistory, type Router } from 'vue-router';
import type { App } from "vue"
import { useAuth } from "@/composables/useAuth.ts";
import AppLayout from "@/layouts/AppLayout.vue";
import PublicLayout from "@/layouts/PublicLayout.vue";

export function createRouter(app: App): Router {
    const router = createVueRouter({
        history: createWebHistory(),
        routes: [
            {
                path: '/',
                component: PublicLayout,
                children: [
                    {
                        path: '',
                        name: 'home',
                        component: () => import("@/views/HomeView.vue"),
                        meta: {
                            title: 'Home',
                            description: 'Welcome to the PDF Marker App. Here you can upload and annotate your PDF documents.',
                            icon: 'pi pi-home'
                        }
                    },
                    {
                        path: 'password-recovery',
                        name: 'password-recovery',
                        component: () => import("@/views/user/PasswordRecovery.vue"),
                    },
                    {
                        path: 'complete-setup',
                        name: 'complete-setup',
                        component: () => import("@/views/user/CompleteAccountSetup.vue"),
                    },
                    {
                        path: 'register',
                        name: 'register',
                        component: () => import("@/views/user/Register.vue"),
                        meta: { title: 'Create Account' },
                    },
                    {
                        path: 'invite/:inviteId',
                        name: 'accept-invite',
                        component: () => import("@/views/invite/AcceptInvite.vue"),
                        meta: { title: 'Accept Invite' },
                    },
                    {
                        path: 'terms',
                        name: 'terms',
                        component: () => import("@/views/legal/TermsOfService.vue"),
                        meta: { title: 'Terms of Service' },
                    },
                    {
                        path: 'privacy',
                        name: 'privacy',
                        component: () => import("@/views/legal/PrivacyPolicy.vue"),
                        meta: { title: 'Privacy Policy' },
                    },
                ],
            },
            {
                path: '/login',
                name: 'login',
                beforeEnter: () => {
                    const auth = useAuth();
                    auth.login();
                    return false;
                },
                component: { template: '' },
            },
            {
                path: '/app',
                component: AppLayout,
                beforeEnter: () => {
                    const auth = useAuth();
                    return auth.isAuthenticated.value ? true : { name: 'login' };
                },
                children: [
                    {
                        path: '',
                        redirect: { name: 'projects' },
                    },
                    {
                        path: 'projects',
                        name: 'projects',
                        component: () => import("@/views/project/ProjectList.vue"),
                    },
                    {
                        path: 'projects/:id',
                        name: 'project-details',
                        component: () => import("@/views/project/ProjectDetail.vue"),
                    },
                    {
                        path: 'projects/:id/documents/:documentId',
                        name: 'project-document',
                        component: () => import("@/views/project/DocumentViewer.vue"),
                    },
                    {
                        path: 'profile',
                        component: () => import("@/views/user/ProfileLayout.vue"),
                        children: [
                            {
                                path: '',
                                redirect: { name: 'profile-general' },
                            },
                            {
                                path: 'general',
                                name: 'profile-general',
                                component: () => import("@/views/user/Profile.vue"),
                            },
                            {
                                path: 'notifications',
                                name: 'profile-notifications',
                                component: () => import("@/views/user/ProfileNotifications.vue"),
                            },
                            {
                                path: 'appearance',
                                name: 'profile-appearance',
                                component: () => import("@/views/user/ProfileAppearance.vue"),
                            },
                            {
                                path: 'security',
                                name: 'profile-security',
                                component: () => import("@/views/user/ProfileSecurity.vue"),
                            },
                        ],
                    },
                    {
                        path: 'notifications',
                        name: 'notifications',
                        component: () => import("@/views/user/Notifications.vue"),
                    },
                    {
                        path: 'search',
                        name: 'search',
                        component: () => import("@/views/search/SearchResults.vue"),
                        meta: { title: 'Search' }
                    },
                    {
                        path: 'workspace/new',
                        name: 'create-workspace',
                        component: () => import('@/views/workspace/CreateWorkspace.vue'),
                        meta: { title: 'Create Workspace' }
                    },
                    {
                        path: 'workspace',
                        name: 'workspace-overview',
                        component: () => import("@/views/workspace/WorkspaceOverview.vue"),
                        meta: { title: 'Workspace' }
                    },
                    {
                        path: 'workspace/settings',
                        component: () => import("@/views/workspace/WorkspaceSettings.vue"),
                        meta: { title: 'Workspace Settings' },
                        children: [
                            {
                                path: '',
                                name: 'workspace-settings',
                                redirect: { name: 'workspace-document-types' },
                            },
                            {
                                path: 'document-types',
                                name: 'workspace-document-types',
                                component: () => import("@/views/workspace/WorkspaceDocumentTypes.vue"),
                            },
                            {
                                path: 'members',
                                name: 'workspace-members',
                                component: () => import("@/views/workspace/WorkspaceMembers.vue"),
                            },
                        ],
                    },
                    {
                        path: 'billing/success',
                        name: 'billing-success',
                        component: () => import('@/views/billing/BillingSuccess.vue'),
                        meta: { title: 'Payment Successful' }
                    },
                    {
                        path: 'billing/cancel',
                        name: 'billing-cancel',
                        component: () => import('@/views/billing/BillingCancel.vue'),
                        meta: { title: 'Payment Cancelled' }
                    },
                    {
                        path: 'settings',
                        redirect: { name: 'workspace-settings' },
                    },
                ]
            },
            {
                path: '/:pathMatch(.*)*',
                component: PublicLayout,
                children: [
                    {
                        path: '',
                        name: 'not-found',
                        component: () => import('@/views/NotFoundView.vue'),
                        meta: {
                            title: '404 Not Found',
                            description: 'The page you are looking for does not exist.',
                            icon: 'pi pi-exclamation-triangle'
                        }
                    }
                ]
            }
        ]
    });

    router.beforeEach(async (to, from, next) => {
        document.title = to.meta.title ? `${to.meta.title} - CedarStack` : 'CedarStack - Intelligent Document Hub';

        const auth = useAuth();
        if (auth.isAuthenticated.value && !auth.currentUser.value) {
            auth.fetchCurrentUser();
        }
        if (auth.isAuthenticated.value && !auth.tenantReady.value) {
            await auth.initializeTenant();
        }

        next();
    });

    return router;
}
