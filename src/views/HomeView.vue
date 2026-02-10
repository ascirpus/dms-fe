<template>
  <div class="min-h-screen bg-[var(--surface-ground)]">
    <!-- Hero Section -->
    <section class="py-20 px-6 bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-ground)]">
      <div class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div class="order-2 lg:order-none">
          <div class="inline-block px-4 py-2 bg-[var(--brand-gold-light)] text-[var(--brand-brown-dark)] rounded-[20px] text-sm font-semibold mb-6">{{ $t('home.badge') }}</div>
          <h1 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] lg:text-[48px] font-bold leading-[1.2] text-[var(--text-color)] mb-6">
            {{ $t('home.heroTitle') }}<br />
            <span class="text-[var(--primary-color)]">{{ $t('home.heroTitleHighlight') }}</span>
          </h1>
          <p class="text-lg leading-[1.7] text-[var(--text-secondary)] mb-8">
            {{ $t('home.heroDescription') }}
          </p>
          <div class="flex flex-col md:flex-row gap-4 items-center md:items-center">
            <Button
              :label="$t('home.getStartedFree')"
              icon="pi pi-arrow-right"
              iconPos="right"
              size="large"
              @click="handleGetStarted('free')"
            />
            <Button
              :label="$t('home.seeFeatures')"
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
              <span>{{ $t('home.heroProjectName') }}</span>
            </div>
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3 p-3 bg-[var(--surface-ground)] rounded-lg text-sm">
                <i class="pi pi-file-pdf text-[var(--color-danger)]"></i>
                <span class="flex-1 text-[var(--text-color)]">{{ $t('home.heroDoc1') }}</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-[#dcfce7] text-[#166534]">{{ $t('home.heroDoc1Status') }}</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-[var(--surface-ground)] rounded-lg text-sm">
                <i class="pi pi-file-pdf text-[var(--color-danger)]"></i>
                <span class="flex-1 text-[var(--text-color)]">{{ $t('home.heroDoc2') }}</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-[#e0e7ff] text-[#3730a3]">{{ $t('home.heroDoc2Status') }}</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-[var(--surface-ground)] rounded-lg text-sm">
                <i class="pi pi-file-pdf text-[var(--color-danger)]"></i>
                <span class="flex-1 text-[var(--text-color)]">{{ $t('home.heroDoc3') }}</span>
                <span class="px-2 py-1 rounded text-xs font-medium bg-[#fef3c7] text-[#92400e]">{{ $t('home.heroDoc3Status') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-6 bg-[var(--surface-card)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">{{ $t('home.featuresTitle') }}</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">{{ $t('home.featuresSubtitle') }}</p>
      </div>

      <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-folder-open text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureProjectOrg') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureProjectOrgDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-comments text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureComments') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureCommentsDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-check-circle text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureApprovals') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureApprovalsDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-pencil text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureSignOff') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureSignOffDesc') }}
          </p>
          <p class="text-[12px] leading-[1.5] text-[var(--text-secondary)] mt-3 mb-0 opacity-80">
            {{ $t('home.featureSignOffNote') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-history text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureVersionControl') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureVersionControlDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-search text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureSearch') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureSearchDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-users text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureCollaboration') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureCollaborationDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-building text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureWorkspaces') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureWorkspacesDesc') }}
          </p>
        </div>

        <div class="p-8 bg-[var(--surface-ground)] rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
          <div class="w-14 h-14 flex items-center justify-center bg-[var(--primary-color)] rounded-xl mb-5">
            <i class="pi pi-bell text-2xl text-white"></i>
          </div>
          <h3 class="text-xl font-semibold text-[var(--text-color)] mb-3">{{ $t('home.featureNotifications') }}</h3>
          <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
            {{ $t('home.featureNotificationsDesc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Permission System Section -->
    <section class="py-20 px-6 bg-[var(--surface-card)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">{{ $t('home.permissionsTitle') }}</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">{{ $t('home.permissionsSubtitle') }}</p>
      </div>

      <div class="max-w-[1200px] mx-auto mb-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div class="flex flex-col gap-3">
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-purple)] border-[#a855f7]">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">{{ $t('home.roleOrganization') }}</div>
            <div class="text-[13px] text-[var(--text-secondary)]">{{ $t('home.roleOrganizationDesc') }}</div>
          </div>
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-blue)] border-[#3b82f6] ml-4">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">{{ $t('home.roleProject') }}</div>
            <div class="text-[13px] text-[var(--text-secondary)]">{{ $t('home.roleProjectDesc') }}</div>
          </div>
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-amber)] border-[#f59e0b] ml-8">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">{{ $t('home.roleParty') }}</div>
            <div class="text-[13px] text-[var(--text-secondary)]">{{ $t('home.rolePartyDesc') }}</div>
          </div>
          <div class="py-5 px-6 rounded-xl border-l-4 bg-[var(--role-bg-green)] border-[#22c55e] ml-12">
            <div class="font-semibold text-[15px] text-[var(--text-color)] mb-0.5">{{ $t('home.roleOverrides') }}</div>
            <div class="text-[13px] text-[var(--text-secondary)]">{{ $t('home.roleOverridesDesc') }}</div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="p-5 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-xl">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-eye text-xl text-[var(--primary-color)]"></i>
              <h4 class="text-lg font-semibold text-[var(--text-color)] m-0">{{ $t('home.permView') }}</h4>
            </div>
            <p class="text-sm text-[var(--text-secondary)] m-0">{{ $t('home.permViewDesc') }}</p>
          </div>

          <div class="p-5 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-xl">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-comment text-xl text-[var(--primary-color)]"></i>
              <h4 class="text-lg font-semibold text-[var(--text-color)] m-0">{{ $t('home.permComment') }}</h4>
            </div>
            <p class="text-sm text-[var(--text-secondary)] m-0">{{ $t('home.permCommentDesc') }}</p>
          </div>

          <div class="p-5 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-xl">
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-check-square text-xl text-[var(--primary-color)]"></i>
              <h4 class="text-lg font-semibold text-[var(--text-color)] m-0">{{ $t('home.permDecide') }}</h4>
            </div>
            <p class="text-sm text-[var(--text-secondary)] m-0">{{ $t('home.permDecideDesc') }}</p>
          </div>
        </div>
      </div>

    </section>

    <!-- Document Types Section -->
    <section class="py-20 px-6 bg-[var(--surface-ground)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">{{ $t('home.docTypesTitle') }}</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">{{ $t('home.docTypesSubtitle') }}</p>
      </div>

      <div class="max-w-[800px] mx-auto mb-8">
        <div class="intro-card flex flex-col md:flex-row gap-6 p-8 rounded-2xl border border-[#bae6fd] md:text-left text-center md:items-start items-center">
          <div class="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-2xl shrink-0">
            <i class="pi pi-cog text-[28px] text-white"></i>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-[var(--text-color)] mb-2">{{ $t('home.customWorkflows') }}</h3>
            <p class="text-[15px] leading-[1.6] text-[var(--text-secondary)] m-0">
              {{ $t('home.customWorkflowsDesc') }}
            </p>
          </div>
        </div>
      </div>

      <div class="visibility-matrix-wrapper max-w-[600px] mx-auto mb-10">
        <table class="visibility-matrix w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"></th>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"><i class="pi pi-wrench block mb-1 text-base text-[var(--text-secondary)]"></i> {{ $t('home.contractor') }}</th>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"><i class="pi pi-building block mb-1 text-base text-[var(--text-secondary)]"></i> {{ $t('home.client') }}</th>
              <th class="px-4 py-3 text-center font-semibold text-[13px] text-[var(--text-color)] border-b-2 border-[var(--surface-border)]"><i class="pi pi-shield block mb-1 text-base text-[var(--text-secondary)]"></i> {{ $t('home.insurer') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">{{ $t('home.damageReport') }}</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">{{ $t('home.repairQuote') }}</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">{{ $t('home.invoice') }}</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
            </tr>
            <tr>
              <td class="px-4 py-3 text-left font-medium text-[var(--text-color)] border-b border-[var(--surface-border)]">{{ $t('home.contract') }}</td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-eye text-[var(--primary-color)]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-check-circle text-[#27ae60]"></i></td>
              <td class="px-4 py-3 text-center border-b border-[var(--surface-border)]"><i class="pi pi-minus text-[var(--surface-border)]"></i></td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-center gap-6 mt-4 text-xs text-[var(--text-secondary)]">
          <span class="flex items-center gap-1.5"><i class="pi pi-eye text-xs text-[var(--primary-color)]"></i> {{ $t('home.canView') }}</span>
          <span class="flex items-center gap-1.5"><i class="pi pi-check-circle text-xs text-[#27ae60]"></i> {{ $t('home.canApprove') }}</span>
          <span class="flex items-center gap-1.5"><i class="pi pi-minus text-xs text-[var(--surface-border)]"></i> {{ $t('home.noAccess') }}</span>
        </div>
      </div>

      <div class="max-w-[1200px] mx-auto mb-4 text-center">
        <span class="inline-block px-4 py-2 bg-[var(--surface-card)] rounded-[20px] text-sm text-[var(--text-secondary)] italic">{{ $t('home.defaultTypes') }}</span>
      </div>

      <div class="max-w-[1200px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-file text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">{{ $t('home.invoice') }}</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">{{ $t('home.viewPermission') }}</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-shopping-cart text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">{{ $t('home.purchaseOrder') }}</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">{{ $t('home.viewPermission') }}</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-file-check text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">{{ $t('home.contract') }}</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">{{ $t('home.viewPermission') }}</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-receipt text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">{{ $t('home.receipt') }}</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">{{ $t('home.viewPermission') }}</span>
        </div>
        <div class="flex flex-col items-center gap-3 p-6 bg-[var(--surface-card)] rounded-xl text-center">
          <i class="pi pi-dollar text-[32px] text-[var(--primary-color)]"></i>
          <h4 class="text-base font-semibold text-[var(--text-color)] m-0">{{ $t('home.quote') }}</h4>
          <span class="px-3 py-1 rounded-xl text-xs font-medium bg-[#fef3c7] text-[#92400e]">{{ $t('home.requiresApproval') }}</span>
        </div>
      </div>
    </section>

    <!-- Plans Section -->
    <section class="py-20 px-6 bg-[var(--surface-ground)]">
      <div class="text-center mb-12">
        <h2 class="font-[Inter,sans-serif] text-[28px] md:text-[36px] font-bold text-[var(--text-color)] mb-4">{{ $t('home.plansTitle') }}</h2>
        <p class="text-lg text-[var(--text-secondary)] m-0">{{ $t('home.plansSubtitle') }}</p>
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
        <span :class="{ 'text-[var(--text-color)] font-semibold': !isYearly }">{{ $t('home.monthly') }}</span>
        <button class="toggle-switch" :class="{ toggled: isYearly }" @click="isYearly = !isYearly">
          <span class="toggle-knob"></span>
        </button>
        <span :class="{ 'text-[var(--text-color)] font-semibold': isYearly }">{{ $t('home.yearly') }}</span>
        <span class="px-3 py-1 bg-[#dcfce7] text-[#166534] rounded-xl text-xs font-semibold" :style="{ visibility: isYearly ? 'visible' : 'hidden' }">{{ $t('home.twoMonthsFree') }}</span>
      </div>

      <div class="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="relative p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">{{ $t('home.planFree') }}</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span class="text-[36px] font-bold text-[var(--text-color)]">&euro;0</span>
              <span class="text-base text-[var(--text-secondary)]">{{ $t('home.perMonth') }}</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">&nbsp;</div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeProjects') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeDocs') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeStorage') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeWorkspaces') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeComments') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeApprovals') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeEmail') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureFreeCustomTypes') }}</li>
          </ul>
          <Button :label="$t('home.getStarted')" outlined class="w-full" @click="handleGetStarted" />
        </div>

        <div class="plan-card-featured relative p-8 bg-[var(--surface-card)] border-2 border-[var(--primary-color)] rounded-2xl flex flex-col shadow-[0_8px_32px_rgba(59,130,246,0.15)]">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary-color)] text-white rounded-xl text-xs font-semibold">{{ $t('home.recommended') }}</div>
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">{{ $t('home.planTeam') }}</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span v-if="isYearly" class="text-xl font-medium text-[var(--text-secondary)] line-through mr-1">&euro;49</span>
              <span class="text-[36px] font-bold text-[var(--text-color)]">&euro;{{ isYearly ? 41 : 49 }}</span>
              <span class="text-base text-[var(--text-secondary)]">{{ $t('home.perMonth') }}</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">
              <template v-if="isYearly">{{ $t('home.billedAmount', { amount: '490' }) }}</template>
              <template v-else>&nbsp;</template>
            </div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamProjects') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamDocs') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamStorage') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamWorkspaces') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamVersioning') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamSignOff') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureTeamCustomTypes') }}</li>
          </ul>
          <Button :label="$t('home.startTrial')" class="w-full" @click="handleGetStarted('team')" />
        </div>

        <div class="relative p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">{{ $t('home.planBusiness') }}</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span v-if="isYearly" class="text-xl font-medium text-[var(--text-secondary)] line-through mr-1">&euro;149</span>
              <span class="text-[36px] font-bold text-[var(--text-color)]">&euro;{{ isYearly ? 124 : 149 }}</span>
              <span class="text-base text-[var(--text-secondary)]">{{ $t('home.perMonth') }}</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">
              <template v-if="isYearly">{{ $t('home.billedAmount', { amount: '1,490' }) }}</template>
              <template v-else>&nbsp;</template>
            </div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureBusinessAll') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureBusinessStorage') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureBusinessWorkspaces') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-upload text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureBusinessUpload') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-star text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureBusinessSupport') }}</li>
          </ul>
          <Button :label="$t('home.startTrial')" class="w-full" @click="handleGetStarted('business')" />
        </div>

        <div class="relative p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl flex flex-col">
          <div class="text-center mb-6">
            <h3 class="text-2xl font-semibold text-[var(--text-color)] mb-2">{{ $t('home.planEnterprise') }}</h3>
            <div class="flex items-baseline justify-center gap-1 min-h-[44px]">
              <span class="text-[36px] font-bold text-[var(--text-color)]">{{ $t('home.planCustom') }}</span>
            </div>
            <div class="text-[13px] text-[var(--text-secondary)] text-center mt-1 min-h-[20px]">&nbsp;</div>
          </div>
          <ul class="list-none p-0 mb-6 flex-1">
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseAll') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-building text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseWorkspaces') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-cloud text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseStorage') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-server text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseSelfHosted') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-lock text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseSso') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseSla') }}</li>
            <li class="flex items-center gap-3 py-2 text-sm text-[var(--text-color)]"><i class="pi pi-check text-sm text-[var(--primary-color)]"></i> {{ $t('home.featureEnterpriseSupport') }}</li>
          </ul>
          <Button :label="$t('home.contactSales')" outlined class="w-full" as="a" href="mailto:sales@cedar-stack.com" />
        </div>
      </div>
    </section>

    <!-- Roadmap -->
    <section class="py-14 px-6 bg-[var(--surface-card)] border-t border-[var(--surface-border)]">
      <div class="max-w-[800px] mx-auto">
        <p class="text-center text-sm text-[var(--text-secondary)] mb-6 tracking-wide uppercase">{{ $t('home.roadmapTitle') }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <span class="roadmap-pill">
            <i class="pi pi-link text-xs"></i> {{ $t('home.roadmapOdoo') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-code text-xs"></i> {{ $t('home.roadmapApi') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-bolt text-xs"></i> {{ $t('home.roadmapWebhooks') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-list text-xs"></i> {{ $t('home.roadmapAuditLogs') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-check-circle text-xs"></i> {{ $t('home.roadmapCascading') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-pencil text-xs"></i> {{ $t('home.roadmapDigitalSig') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-shield text-xs"></i> {{ $t('home.roadmapEidasAdes') }}
          </span>
          <span class="roadmap-pill">
            <i class="pi pi-verified text-xs"></i> {{ $t('home.roadmapEidasQes') }}
          </span>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section py-20 px-6 bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-dark)]">
      <div class="max-w-[600px] mx-auto text-center">
        <h2 class="text-[36px] font-bold text-white mb-4">{{ $t('home.ctaTitle') }}</h2>
        <p class="text-lg text-white/90 mb-8">{{ $t('home.ctaSubtitle') }}</p>
        <div class="flex justify-center gap-4">
          <Button
            :label="$t('home.ctaButton')"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="large"
            @click="handleGetStarted('free')"
          />
        </div>
        <p class="text-sm! text-white/70! mt-4!">{{ $t('home.ctaDisclaimer') }}</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-6 bg-[var(--surface-section)] border-t border-[var(--surface-border)]">
      <div class="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
        <div class="flex items-center gap-4">
          <Logo size="sm" />
          <p class="text-[var(--text-secondary)] m-0 text-sm">{{ $t('home.footerTagline') }}</p>
        </div>
        <div class="flex flex-wrap justify-center gap-6">
          <a href="mailto:support@cedarstack.io" class="text-[var(--text-secondary)] no-underline text-sm transition-colors duration-200 hover:text-[var(--text-color)]">{{ $t('home.footerContact') }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Slider from 'primevue/slider';
import Logo from '@/components/base/Logo.vue';
import posthog from "posthog-js";

const { t } = useI18n();
const router = useRouter();
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
  router.push({ name: 'register', query: plan ? { plan } : undefined });
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
