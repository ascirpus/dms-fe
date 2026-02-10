import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CedarStack Docs',
  description: 'Documentation for CedarStack — the intelligent document hub for teams. Secure collaboration, approval workflows, and organized document management.',
  base: '/docs/',

  head: [
    ['link', { rel: 'icon', href: '/docs/images/logo.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'CedarStack Documentation' }],
    ['meta', { name: 'og:description', content: 'Documentation for CedarStack — the intelligent document hub for teams.' }],
    ['meta', { name: 'og:url', content: 'https://www.cedar-stack.com/docs/' }],
  ],

  sitemap: {
    hostname: 'https://www.cedar-stack.com',
  },

  themeConfig: {
    siteTitle: 'CedarStack Docs',

    nav: [
      { text: 'User Guide', link: '/user-guide/' },
      { text: 'Admin Guide', link: '/admin-guide/' },
      { text: 'Back to App', link: 'https://www.cedar-stack.com' },
    ],

    sidebar: {
      '/user-guide/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Overview', link: '/user-guide/' },
            { text: 'Getting Started', link: '/user-guide/getting-started' },
            { text: 'Projects', link: '/user-guide/projects' },
            { text: 'Documents', link: '/user-guide/documents' },
            { text: 'Permissions', link: '/user-guide/permissions' },
            { text: 'Approvals', link: '/user-guide/approvals' },
            { text: 'Signatures', link: '/user-guide/signatures' },
            { text: 'Collaboration', link: '/user-guide/collaboration' },
          ],
        },
      ],
      '/admin-guide/': [
        {
          text: 'Admin Guide',
          items: [
            { text: 'Overview', link: '/admin-guide/' },
            { text: 'Tenant Setup', link: '/admin-guide/tenant-setup' },
            { text: 'User Management', link: '/admin-guide/user-management' },
            { text: 'Document Types', link: '/admin-guide/document-types' },
            { text: 'Billing & Plans', link: '/admin-guide/billing' },
            { text: 'Integrations', link: '/admin-guide/integrations' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    footer: {
      message: 'CedarStack — Intelligent Document Management',
      copyright: `Copyright © ${new Date().getFullYear()} CedarStack`,
    },
  },
})
