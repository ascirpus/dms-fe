<template>
  <div class="max-w-[800px] mx-auto py-12 px-6 text-[var(--text-color)]">
    <h1 class="text-3xl font-bold mb-2">Privacy Policy</h1>
    <p class="text-[var(--text-secondary)] mb-10">Last updated: February 9, 2026</p>

    <div class="space-y-10 leading-relaxed">
      <section>
        <h2 class="text-xl font-semibold mb-3">Who we are</h2>
        <p>CedarStack is a document management service. This policy explains what data we collect, why, and how we handle it. If you have questions, contact us at <a href="mailto:support@cedar-stack.com" class="text-[var(--primary-color)] hover:underline">support@cedar-stack.com</a>.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">What we collect</h2>

        <h3 class="font-medium mt-4 mb-2">Account information</h3>
        <p>When you create an account, we collect your name, email address, and profile picture. This information comes from your login provider (Keycloak) and is used to identify you within the service.</p>

        <h3 class="font-medium mt-4 mb-2">Documents and content</h3>
        <p>We store the documents you upload, along with annotations, comments, and project metadata. This is the core of what we do — we need your content to provide the service.</p>
        <p class="mt-2">If you use a self-hosted file store, your document files remain on your own infrastructure. However, we still collect and process document metadata — such as file names, page counts, and text content — to provide search, indexing, and annotation features.</p>

        <h3 class="font-medium mt-4 mb-2">Workspace information</h3>
        <p>If you create or join a workspace, we store the workspace name, membership, and settings. Other members of your workspace can see your name and profile picture.</p>

        <h3 class="font-medium mt-4 mb-2">Usage data</h3>
        <p>We use PostHog to collect anonymous usage data such as page views and feature interactions. This data is stored in memory only and is not persisted across sessions. We do not use cookies for analytics. This data helps us understand how the service is used so we can improve it.</p>

        <h3 class="font-medium mt-4 mb-2">Authentication cookies</h3>
        <p>We use cookies strictly for authentication and session management. These are essential for the service to work and cannot be disabled.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Why we collect it</h2>
        <p>We only collect data that's necessary to provide and improve the service:</p>
        <ul class="list-disc pl-6 space-y-2 mt-3">
          <li><strong>To provide the service</strong> — storing your documents, managing your account, enabling collaboration</li>
          <li><strong>To improve the service</strong> — understanding which features are used and where users run into problems</li>
          <li><strong>To communicate with you</strong> — sending notifications you've opted into, responding to support requests</li>
          <li><strong>To process payments</strong> — if you have a paid subscription, we share necessary billing information with our payment processor</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Who we share it with</h2>
        <p>We don't sell your data. We don't use it for advertising. We share data only with:</p>
        <ul class="list-disc pl-6 space-y-2 mt-3">
          <li><strong>Workspace members</strong> — your name and profile picture are visible to people in your workspace</li>
          <li><strong>Service providers</strong> — we use third-party services to operate (hosting, payment processing, analytics). These providers only receive the minimum data necessary and are bound by their own privacy policies</li>
          <li><strong>Legal requirements</strong> — if required by law, we may disclose data to comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Where your data is stored</h2>
        <p>Your data is stored on servers in the European Union. Analytics data is processed by PostHog's EU infrastructure.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">How long we keep it</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li><strong>Account data</strong> — kept as long as your account is active. Deleted when you delete your account.</li>
          <li><strong>Documents and content</strong> — kept until you delete them, or until your account is deleted.</li>
          <li><strong>Usage data</strong> — anonymous analytics data is retained for up to 12 months.</li>
          <li><strong>Payment records</strong> — kept as long as required by tax and accounting regulations.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Your rights</h2>
        <p>Under Swiss and European data protection law, you have the right to:</p>
        <ul class="list-disc pl-6 space-y-2 mt-3">
          <li><strong>Access</strong> your personal data</li>
          <li><strong>Correct</strong> inaccurate data</li>
          <li><strong>Delete</strong> your data</li>
          <li><strong>Export</strong> your data in a portable format</li>
          <li><strong>Object</strong> to processing of your data</li>
        </ul>
        <p class="mt-3">To exercise any of these rights, contact us at <a href="mailto:support@cedar-stack.com" class="text-[var(--primary-color)] hover:underline">support@cedar-stack.com</a>.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Children</h2>
        <p>CedarStack is not intended for anyone under 16 years of age. We do not knowingly collect data from children.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Changes to this policy</h2>
        <p>We may update this policy from time to time. If we make significant changes, we'll notify you via email or through the service.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold mb-3">Contact</h2>
        <p>Questions or concerns about your privacy? Reach us at <a href="mailto:support@cedar-stack.com" class="text-[var(--primary-color)] hover:underline">support@cedar-stack.com</a>.</p>
      </section>
    </div>
  </div>
</template>
