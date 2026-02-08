<template>
  <div class="min-h-screen bg-[var(--surface-ground)]">
    <!-- Hero Section -->
    <section class="py-20 px-6 bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-ground)]">
      <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div class="order-2 lg:order-none">
          <div class="inline-block px-4 py-2 bg-[var(--brand-gold-light)] text-[var(--brand-brown-dark)] rounded-[20px] text-sm font-semibold mb-6">Intelligent Document Hub</div>
          <h1 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] lg:text-[48px] font-bold leading-[1.2] text-[var(--text-color)] mb-6">
            Manage Project Documents<br />
            <span class="text-[var(--primary-color)]">With Precision Control</span>
          </h1>
          <p class="text-lg leading-[1.7] text-[var(--text-secondary)] mb-8">
            Streamline your document workflows with secure collaboration, approval tracking,
            and digital signatures — all in one place. Organize by project, control who sees what,
            and keep your team aligned.
          </p>
          <div class="flex flex-col md:flex-row gap-4 items-center md:items-center">
            <Button
              label="Get Started Free"
              icon="pi pi-arrow-right"
              iconPos="right"
              size="large"
              @click="handleGetStarted('free')"
            />
            <Button
              label="See Features"
              icon="pi pi-chevron-down"
              text
              size="large"
              @click="scrollToFeatures('free')"
            />
          </div>
        </div>
        <div class="flex justify-center order-1 lg:order-none">
          <div class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl p-6 w-full max-w-[400px] shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
            <div class="flex items-center gap-3 pb-4 border-b border-[var(--surface-border)] mb-4 font-semibold text-[var(--text-color)]">
              <i class="pi pi-folder text-[var(--brand-gold)] text-xl"></i>
              <span>Office Renovation Project</span>
            </div>
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3 p-3 bg-[var(--surface-ground)] rounded-lg text-sm">
                <i class="pi pi-file-pdf text-[var(--color-danger)]"></i>
                <span class="flex-1 text-[var(--text-color)]">Damage Report v2.pdf</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-[#dcfce7] text-[#166534]">Approved</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-[var(--surface-ground)] rounded-lg text-sm">
                <i class="pi pi-file-pdf text-[var(--color-danger)]"></i>
                <span class="flex-1 text-[var(--text-color)]">Contractor Quote.pdf</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-[#e0e7ff] text-[#3730a3]">2 Signatures</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-[var(--surface-ground)] rounded-lg text-sm">
                <i class="pi pi-file-pdf text-[var(--color-danger)]"></i>
                <span class="flex-1 text-[var(--text-color)]">Hours Confirmation.pdf</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-[#fef3c7] text-[#92400e]">In Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-6 bg-[var(--surface-card)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">Everything You Need</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">Powerful features designed for professional document management</p>
      </div>

      <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-folder-open text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Project-Based Organization</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Organize all your documents by project. Each project maintains its own
            document library, parties, and permission settings.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-comments text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Contextual Comments</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Add comments directly on document pages. Mark specific areas, discuss changes,
            and track resolution status in real-time.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-check-circle text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Approval Workflows</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Define approval thresholds per document type. Track pending reviews,
            approvals, and rejections with configurable deadlines.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-pencil text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Document Sign-Off</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Assign required signers or allow voluntary acknowledgments.
            Set signature deadlines with reminders and track who signed and when.
          </p>
          <p class="text-[12px] leading-[1.5] text-[var(--text-secondary)] mt-3 mb-0 opacity-80">
            Every sign-off records signer identity, intent, and a tamper-evident audit trail
            &mdash; meeting eIDAS Simple Electronic Signature (SES) criteria.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-history text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Version Control</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Track document history with full version control. Every upload is versioned
            so you never lose important changes.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-search text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Full-Text Search</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Search across all document contents instantly. Powered by Apache Tika
            for deep content extraction from PDFs and other file types.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-users text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Multi-Party Collaboration</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Invite contractors, clients, insurers, and other stakeholders.
            Each party sees only what they're permitted to access.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-building text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Multiple Workspaces</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Run separate workspaces for different teams or clients. Each workspace
            has its own projects, members, roles, and usage limits.
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-bell text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">Smart Notifications</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            Get alerts for new documents, pending approvals, signature requests,
            and deadline reminders. Stay on top of what matters.
          </p>
        </div>
      </div>
    </section>

    <!-- Permission System Section -->
    <section class="py-20 px-6 bg-[var(--surface-card)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">Powerful Permission System</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">Fine-grained access control that scales with your organization</p>
      </div>

      <div class="max-w-[1200px] mx-auto mb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div class="flex flex-col gap-3">
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-purple)] border-[#a855f7]">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">Organization Roles</div>
            <div class="text-[13px] text-[var(--text-secondary)]">Owner, Admin, or Member access levels</div>
          </div>
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-blue)] border-[#3b82f6] ml-4">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">Project Membership</div>
            <div class="text-[13px] text-[var(--text-secondary)]">Base access to project documents</div>
          </div>
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-amber)] border-[#f59e0b] ml-8">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">Party Permissions</div>
            <div class="text-[13px] text-[var(--text-secondary)]">Role-based access by document type</div>
          </div>
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-green)] border-[#22c55e] ml-12">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">User Overrides</div>
            <div class="text-[13px] text-[var(--text-secondary)]">Individual exceptions when needed</div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="p-5 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-xl">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-eye text-xl text-[var(--primary-color)]"></i>
              <h4 class="text-lg font-semibold text-[var(--text-color)] m-0">View</h4>
            </div>
            <p class="text-sm text-[var(--text-secondary)] m-0">See documents and their contents. The foundation of all access.</p>
          </div>

          <div class="p-5 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-xl">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-comment text-xl text-[var(--primary-color)]"></i>
              <h4 class="text-lg font-semibold text-[var(--text-color)] m-0">Comment</h4>
            </div>
            <p class="text-sm text-[var(--text-secondary)] m-0">Add feedback and annotations. Includes View permission automatically.</p>
          </div>

          <div class="p-5 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-xl">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-check-square text-xl text-[var(--primary-color)]"></i>
              <h4 class="text-lg font-semibold text-[var(--text-color)] m-0">Decide</h4>
            </div>
            <p class="text-sm text-[var(--text-secondary)] m-0">Approve or reject documents. Full access including View and Comment.</p>
          </div>
        </div>
      </div>

    </section>

    <!-- Document Types Section -->
    <section class="py-20 px-6 bg-[var(--surface-ground)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">Flexible Document Types</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">Each document type carries its own visibility and permission rules</p>
      </div>

      <div class="max-w-[800px] mx-auto mb-8">
        <div class="intro-card flex flex-col md:flex-row gap-6 p-8 rounded-2xl border border-[#bae6fd] md:text-left text-center md:items-start items-center">
          <div class="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-2xl shrink-0">
            <i class="pi pi-cog text-[28px] text-white"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-[var(--text-color)] mb-2">Customizable Workflows</h3>
            <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
              Control which parties can view, comment on, or approve specific types of documents
              — so a contractor sees only what's relevant to them, while sensitive documents stay restricted.
            </p>
          </div>
        </div>
      </div>

      <div class="visibility-matrix-wrapper max-w-[600px] mx-auto mb-10">
        <table class="visibility-matrix w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"></th>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"><i class="pi pi-wrench block mb-1 text-base text-[var(--text-secondary)]"></i> Contractor</th>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"><i class="pi pi-building block mb-1 text-base text-[var(--text-secondary)]"></i> Client</th>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"><i class="pi pi-shield block mb-1 text-base text-[var(--text-secondary)]"></i> Insurer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">Damage Report</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">Repair Quote</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">Invoice</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">Contract</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-minus text-[var(--surface-border)]"></i></td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-center gap-6 mt-4 text-xs text-[var(--text-secondary)]">
          <span class="flex items-center gap-1.5"><i class="pi pi-eye text-xs text-[var(--primary-color)]"></i> Can view</span>
          <span class="flex items-center gap-1.5"><i class="pi pi-check-circle text-xs text-[#27ae60]"></i> Can approve</span>
          <span class="flex items-center gap-1.5"><i class="pi pi-minus text-xs text-[var(--surface-border)]"></i> No access</span>
        </div>
      </div>

      <div class="max-w-[1200px] mx-auto mb-4 text-center">
        <span class="inline-block px-4 py-2 bg-[var(--surface-card)] rounded-[20px] text-sm text-[var(--text-secondary)] italic">Every account includes these defaults &mdash; all tiers can create custom types:</span>
      </div>

      <div class="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-file text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">Invoice</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">View</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-shopping-cart text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">Purchase Order</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">View</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-file-check text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">Contract</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">View</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-receipt text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">Receipt</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">View</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-dollar text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">Quote</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#fef3c7] text-[#92400e]">Requires Approval</span>
        </div>
      </div>
    </section>

    <!-- Plans Section -->
    <section class="py-20 px-6 bg-[var(--surface-ground)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">Plans That Scale With You</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">Start free and upgrade as your needs grow</p>
      </div>

      <!-- Pricing Calculator (hidden for now) -->
      <div v-if="false" class="max-w-[700px] mx-auto mb-12 p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl">
        <h3 class="text-xl font-semibold text-[var(--text-color)] mb-6 flex items-center gap-2.5"><i class="pi pi-calculator text-[var(--primary-color)]"></i> Find Your Plan</h3>
        <div class="flex flex-col gap-6 mb-7">
          <div class="flex flex-col gap-2.5">
            <div class="flex justify-between items-center text-sm text-[var(--text-secondary)]">
              <span>Projects</span>
              <strong class="text-base text-[var(--text-color)]">{{ calcProjects }}</strong>
            </div>
            <Slider v-model="calcProjects" :min="1" :max="100" />
          </div>
          <div class="flex flex-col gap-2.5">
            <div class="flex justify-between items-center text-sm text-[var(--text-secondary)]">
              <span>Documents per project</span>
              <strong class="text-base text-[var(--text-color)]">{{ calcDocs }}</strong>
            </div>
            <Slider v-model="calcDocs" :min="1" :max="500" />
          </div>
        </div>
        <div class="p-5 bg-[var(--surface-ground)] rounded-xl flex flex-col gap-4">
          <div class="flex items-center gap-2 text-sm text-[var(--text-color)]">
            <i class="pi pi-database text-[var(--primary-color)]"></i>
            <span>Estimated storage: <strong>{{ estimatedStorageLabel }}</strong></span>
            <span class="text-[var(--text-secondary)] text-xs">(~{{ AVG_PDF_SIZE_MB }} MB &times; {{ AVG_VERSIONS_PER_DOC }} versions per doc)</span>
          </div>
          <div class="flex items-center justify-between flex-wrap gap-2 lg:flex-row flex-col lg:items-center items-start">
            <div class="flex items-center gap-2 text-[15px] text-[var(--text-color)]">
              <span>Recommended plan:</span>
              <strong class="text-lg text-[var(--primary-color)]">{{ recommendedTier.name }}</strong>
            </div>
            <div v-if="recommendedTier.monthlyPrice !== null" class="flex items-center gap-2 text-base text-[var(--text-color)]">
              <template v-if="isYearly">
                <strong>&euro;{{ recommendedTier.yearlyMonthlyPrice }}/mo</strong>
                <span class="px-2.5 py-0.5 bg-[#dcfce7] text-[#166534] rounded-[10px] text-xs font-semibold">Save &euro;{{ recommendedTier.monthlyPrice * 12 - recommendedTier.yearlyTotal }}/year</span>
              </template>
              <template v-else>
                <strong>&euro;{{ recommendedTier.monthlyPrice }}/mo</strong>
                <span class="text-[13px] text-[var(--text-secondary)]">or &euro;{{ recommendedTier.yearlyMonthlyPrice }}/mo billed yearly</span>
              </template>
            </div>
            <div v-else class="flex items-center gap-2 text-base text-[var(--text-color)]">
              <strong>Custom pricing</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 mb-10 text-[15px] text-[var(--text-secondary)]">
        <span :class="{ 'text-[var(--text-color)] font-semibold': !isYearly }">Monthly</span>
        <button class="toggle-switch" :class="{ toggled: isYearly }" @click="isYearly = !isYearly">
          <span class="toggle-knob"></span>
        </button>
        <span :class="{ 'text-[var(--text-color)] font-semibold': isYearly }">Yearly</span>
        <span class="px-3 py-1 bg-[#dcfce7] text-[#166534] rounded-xl text-xs font-semibold" :style="{ visibility: isYearly ? 'visible' : 'hidden' }">2 months free</span>
      </div>

      <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="relative p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">Free</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span class="text-[36px] font-bold text-[var(--text-color)]">&euro;0</span>
              <span class="text-base text-[var(--text-secondary)]">/month</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">&nbsp;</div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> 5 projects, 2 parties each</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> 10 documents per project</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> 250 MB storage</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> 1 workspace</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Comments &amp; annotations</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Approvals &amp; deadlines</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Email notifications</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Custom document types (up to 3)</li>
          </ul>
          <Button label="Get Started" outlined class="w-full" @click="handleGetStarted" />
        </div>

        <div class="plan-card-featured relative p-8 bg-[var(--surface-card)] border-2 border-[var(--primary-color)] rounded-2xl flex flex-col shadow-[0_8px_32px_rgba(59,130,246,0.15)]">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary-color)] text-white rounded-xl text-xs font-semibold">Recommended</div>
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">Team</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span v-if="isYearly" class="text-xl font-medium text-[var(--text-secondary)] line-through mr-1">&euro;49</span>
              <span class="text-[36px] font-bold text-[var(--text-color)]">&euro;{{ isYearly ? 41 : 49 }}</span>
              <span class="text-base text-[var(--text-secondary)]">/month</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">
              <template v-if="isYearly">billed &euro;490/year</template>
              <template v-else>&nbsp;</template>
            </div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Unlimited projects &amp; parties</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Unlimited documents</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> 10 GB storage</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> 1 workspace</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Document versioning</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Document sign-off</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Unlimited custom document types</li>
          </ul>
          <Button label="Start 14-Day Free Trial" class="w-full" @click="handleGetStarted('team')" />
        </div>

        <div class="relative p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">Business</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span v-if="isYearly" class="text-xl font-medium text-[var(--text-secondary)] line-through mr-1">&euro;149</span>
              <span class="text-[36px] font-bold text-[var(--text-color)]">&euro;{{ isYearly ? 124 : 149 }}</span>
              <span class="text-base text-[var(--text-secondary)]">/month</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">
              <template v-if="isYearly">billed &euro;1,490/year</template>
              <template v-else>&nbsp;</template>
            </div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Everything in Team</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> 100 GB cloud storage</li>
            <li class="flex justify-center py-0 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">or</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-server text-sm text-[var(--primary-color)]"></i> Self-hosted file storage</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> Up to 3 workspaces</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-upload text-sm text-[var(--primary-color)]"></i> 250 MB file uploads</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-star text-sm text-[var(--primary-color)]"></i> Priority support</li>
          </ul>
          <Button label="Start 14-Day Free Trial" class="w-full" @click="handleGetStarted('business')" />
        </div>

        <div class="relative p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">Enterprise</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span class="text-[36px] font-bold text-[var(--text-color)]">Custom</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">&nbsp;</div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Everything in Business</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> Custom workspaces</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> Unlimited storage</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-lock text-sm text-[var(--primary-color)]"></i> SSO / SAML</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Custom SLAs</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> Dedicated support</li>
          </ul>
          <Button label="Contact Sales" outlined class="w-full" as="a" href="mailto:sales@cedar-stack.com" />
        </div>
      </div>
    </section>

    <!-- Roadmap -->
    <section class="py-14 px-6 bg-[var(--surface-card)] border-t border-[var(--surface-border)]">
      <div class="max-w-[800px] mx-auto">
        <p class="text-center text-sm text-[var(--text-secondary)] mb-6 tracking-wide uppercase">On the roadmap</p>
        <div class="flex flex-wrap justify-center gap-3">
          <span class="roadmap-pill">
            <i class="pi pi-link text-xs"></i> Odoo Integration
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-code text-xs"></i> API Access
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-bolt text-xs"></i> Webhooks
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-list text-xs"></i> Audit Logs
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-check-circle text-xs"></i> Cascading Approvals
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-pencil text-xs"></i> Digital Signatures
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-shield text-xs"></i> eIDAS AdES
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-verified text-xs"></i> eIDAS QES
          </span>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section py-20 px-6 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-dark)]">
      <div class="max-w-[600px] mx-auto text-center">
        <h2 class="text-[36px] font-bold text-white mb-4">Ready to Get Started?</h2>
        <p class="text-lg text-white/90 mb-8">Join teams who trust CedarStack DMS for their document management needs</p>
        <div class="flex justify-center gap-4">
          <Button
            label="Start Free"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="large"
            @click="handleGetStarted('free')"
          />
        </div>
        <p class="text-sm! text-white/70! mt-4!">No credit card required. 14-day Team trial, then free forever on the Free plan.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-6 bg-[var(--surface-section)] border-t border-[var(--surface-border)]">
      <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        <div class="flex items-center gap-4">
          <Logo size="sm" />
          <p class="text-[var(--text-secondary)] m-0 text-sm">Intelligent Document Hub</p>
        </div>
        <div class="flex flex-wrap justify-center gap-6">
          <a href="mailto:support@cedarstack.io" class="text-[var(--text-secondary)] no-underline text-sm transition-colors duration-200 hover:text-[var(--text-color)]">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import Button from 'primevue/button';
import Slider from 'primevue/slider';
import Logo from '@/components/base/Logo.vue';
import posthog from "posthog-js";

const auth = useAuth();
const isYearly = ref(true);

const AVG_PDF_SIZE_MB = 2.5;
const AVG_VERSIONS_PER_DOC = 3;
const calcProjects = ref(5);
const calcDocs = ref(20);

const estimatedStorageMB = computed(() =>
  calcProjects.value * calcDocs.value * AVG_VERSIONS_PER_DOC * AVG_PDF_SIZE_MB
);

const estimatedStorageLabel = computed(() => {
  const mb = estimatedStorageMB.value;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
});

const recommendedTier = computed(() => {
  const storageGB = estimatedStorageMB.value / 1024;

  if (calcProjects.value <= 5 && calcDocs.value <= 10 && estimatedStorageMB.value <= 250) {
    return { name: 'Free', monthlyPrice: 0, yearlyMonthlyPrice: 0, yearlyTotal: 0 };
  }
  if (storageGB <= 10) {
    return { name: 'Team', monthlyPrice: 49, yearlyMonthlyPrice: 41, yearlyTotal: 490 };
  }
  if (storageGB <= 100) {
    return { name: 'Business', monthlyPrice: 149, yearlyMonthlyPrice: 124, yearlyTotal: 1490 };
  }
  return { name: 'Enterprise', monthlyPrice: null, yearlyMonthlyPrice: null, yearlyTotal: null };
});

function handleGetStarted(plan?: string) {
  posthog.capture('landing_get_started_click', { plan: plan || 'unspecified' });
  auth.login();
}

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
}
</script>

<style scoped>
/* Toggle switch requires precise absolute positioning */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background-color: var(--surface-border);
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0;
}

.toggle-switch.toggled {
  background-color: var(--primary-color);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch.toggled .toggle-knob {
  transform: translateX(22px);
}

/* Intro card gradient needs dark mode override via html.dark which requires :deep or global */
.intro-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

html.dark .intro-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af20 100%);
  border-color: #1e40af;
}

.roadmap-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
}

/* CTA button overrides for PrimeVue internals */
.cta-section :deep(.p-button) {
  background-color: white;
  color: var(--primary-color);
  border: none;
}

.cta-section :deep(.p-button:hover) {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
