<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">Intelligent Document Hub</div>
          <h1 class="hero-title">
            Manage Project Documents<br />
            <span class="highlight">With Precision Control</span>
          </h1>
          <p class="hero-description">
            Streamline your document workflows with secure collaboration, approval tracking,
            and digital signatures — all in one place. Organize by project, control who sees what,
            and keep your team aligned.
          </p>
          <div class="hero-actions">
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
        <div class="hero-visual">
          <div class="hero-card">
            <div class="card-header">
              <i class="pi pi-folder"></i>
              <span>Office Renovation Project</span>
            </div>
            <div class="card-documents">
              <div class="doc-item">
                <i class="pi pi-file-pdf"></i>
                <span>Damage Report v2.pdf</span>
                <span class="doc-status approved">Approved</span>
              </div>
              <div class="doc-item">
                <i class="pi pi-file-pdf"></i>
                <span>Contractor Quote.pdf</span>
                <span class="doc-status pending">2 Signatures</span>
              </div>
              <div class="doc-item">
                <i class="pi pi-file-pdf"></i>
                <span>Hours Confirmation.pdf</span>
                <span class="doc-status review">In Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="section-header">
        <h2>Everything You Need</h2>
        <p>Powerful features designed for professional document management</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-folder-open"></i>
          </div>
          <h3>Project-Based Organization</h3>
          <p>
            Organize all your documents by project. Each project maintains its own
            document library, parties, and permission settings.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-comments"></i>
          </div>
          <h3>Contextual Comments</h3>
          <p>
            Add comments directly on document pages. Mark specific areas, discuss changes,
            and track resolution status in real-time.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h3>Approval Workflows</h3>
          <p>
            Define approval thresholds per document type. Track pending reviews,
            approvals, and rejections with configurable deadlines.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-pencil"></i>
          </div>
          <h3>Document Sign-Off</h3>
          <p>
            Assign required signers or allow voluntary acknowledgments.
            Set signature deadlines with reminders and track who signed and when.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-history"></i>
          </div>
          <h3>Version Control</h3>
          <p>
            Track document history with full version control. Every upload is versioned
            so you never lose important changes.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-search"></i>
          </div>
          <h3>Full-Text Search</h3>
          <p>
            Search across all document contents instantly. Powered by Apache Tika
            for deep content extraction from PDFs and other file types.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-users"></i>
          </div>
          <h3>Multi-Party Collaboration</h3>
          <p>
            Invite contractors, clients, insurers, and other stakeholders.
            Each party sees only what they're permitted to access.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-building"></i>
          </div>
          <h3>Multiple Workspaces</h3>
          <p>
            Run separate workspaces for different teams or clients. Each workspace
            has its own projects, members, roles, and usage limits.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="pi pi-bell"></i>
          </div>
          <h3>Smart Notifications</h3>
          <p>
            Get alerts for new documents, pending approvals, signature requests,
            and deadline reminders. Stay on top of what matters.
          </p>
        </div>
      </div>
    </section>

    <!-- Permission System Section -->
    <section class="permissions-section">
      <div class="section-header">
        <h2>Powerful Permission System</h2>
        <p>Fine-grained access control that scales with your organization</p>
      </div>

      <div class="permissions-content">
        <div class="permission-diagram">
          <div class="permission-layer layer-org">
            <div class="layer-label">Organization Roles</div>
            <div class="layer-description">Owner, Admin, or Member access levels</div>
          </div>
          <div class="permission-layer layer-project">
            <div class="layer-label">Project Membership</div>
            <div class="layer-description">Base access to project documents</div>
          </div>
          <div class="permission-layer layer-party">
            <div class="layer-label">Party Permissions</div>
            <div class="layer-description">Role-based access by document type</div>
          </div>
          <div class="permission-layer layer-user">
            <div class="layer-label">User Overrides</div>
            <div class="layer-description">Individual exceptions when needed</div>
          </div>
        </div>

        <div class="permission-details">
          <div class="permission-card">
            <div class="permission-header">
              <i class="pi pi-eye"></i>
              <h4>View</h4>
            </div>
            <p>See documents and their contents. The foundation of all access.</p>
          </div>

          <div class="permission-card">
            <div class="permission-header">
              <i class="pi pi-comment"></i>
              <h4>Comment</h4>
            </div>
            <p>Add feedback and annotations. Includes View permission automatically.</p>
          </div>

          <div class="permission-card">
            <div class="permission-header">
              <i class="pi pi-check-square"></i>
              <h4>Decide</h4>
            </div>
            <p>Approve or reject documents. Full access including View and Comment.</p>
          </div>
        </div>
      </div>

    </section>

    <!-- Document Types Section -->
    <section class="doctypes-section">
      <div class="section-header">
        <h2>Flexible Document Types</h2>
        <p>Each document type carries its own visibility and permission rules</p>
      </div>

      <div class="doctypes-intro">
        <div class="intro-card">
          <div class="intro-icon">
            <i class="pi pi-cog"></i>
          </div>
          <div class="intro-content">
            <h3>Customizable Workflows</h3>
            <p>
              Control which parties can view, comment on, or approve specific types of documents
              — so a contractor sees only what's relevant to them, while sensitive documents stay restricted.
            </p>
          </div>
        </div>
      </div>

      <div class="doctypes-visibility">
        <table class="visibility-matrix">
          <thead>
            <tr>
              <th></th>
              <th><i class="pi pi-wrench"></i> Contractor</th>
              <th><i class="pi pi-building"></i> Client</th>
              <th><i class="pi pi-shield"></i> Insurer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="doc-label">Damage Report</td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-check-circle"></i></td>
            </tr>
            <tr>
              <td class="doc-label">Repair Quote</td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-check-circle"></i></td>
            </tr>
            <tr>
              <td class="doc-label">Invoice</td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-check-circle"></i></td>
            </tr>
            <tr>
              <td class="doc-label">Contract</td>
              <td><i class="pi pi-eye"></i></td>
              <td><i class="pi pi-check-circle"></i></td>
              <td><i class="pi pi-minus"></i></td>
            </tr>
          </tbody>
        </table>
        <div class="visibility-legend">
          <span><i class="pi pi-eye"></i> Can view</span>
          <span><i class="pi pi-check-circle"></i> Can approve</span>
          <span><i class="pi pi-minus"></i> No access</span>
        </div>
      </div>

      <div class="doctypes-example-label">
        <span>Every account includes these defaults &mdash; all tiers can create custom types:</span>
      </div>

      <div class="doctypes-grid">
        <div class="doctype-card">
          <i class="pi pi-file"></i>
          <h4>Invoice</h4>
          <span class="doctype-badge info">View</span>
        </div>
        <div class="doctype-card">
          <i class="pi pi-shopping-cart"></i>
          <h4>Purchase Order</h4>
          <span class="doctype-badge info">View</span>
        </div>
        <div class="doctype-card">
          <i class="pi pi-file-check"></i>
          <h4>Contract</h4>
          <span class="doctype-badge info">View</span>
        </div>
        <div class="doctype-card">
          <i class="pi pi-receipt"></i>
          <h4>Receipt</h4>
          <span class="doctype-badge info">View</span>
        </div>
        <div class="doctype-card">
          <i class="pi pi-dollar"></i>
          <h4>Quote</h4>
          <span class="doctype-badge approval">Requires Approval</span>
        </div>
      </div>
    </section>

    <!-- Plans Section -->
    <section class="plans-section">
      <div class="section-header">
        <h2>Plans That Scale With You</h2>
        <p>Start free and upgrade as your needs grow</p>
      </div>

      <!-- Pricing Calculator (hidden for now) -->
      <div v-if="false" class="pricing-calculator">
        <h3><i class="pi pi-calculator"></i> Find Your Plan</h3>
        <div class="calculator-inputs">
          <div class="calc-input-group">
            <div class="calc-input-label">
              <span>Projects</span>
              <strong>{{ calcProjects }}</strong>
            </div>
            <Slider v-model="calcProjects" :min="1" :max="100" />
          </div>
          <div class="calc-input-group">
            <div class="calc-input-label">
              <span>Documents per project</span>
              <strong>{{ calcDocs }}</strong>
            </div>
            <Slider v-model="calcDocs" :min="1" :max="500" />
          </div>
        </div>
        <div class="calculator-result">
          <div class="result-storage">
            <i class="pi pi-database"></i>
            <span>Estimated storage: <strong>{{ estimatedStorageLabel }}</strong></span>
            <span class="storage-note">(~{{ AVG_PDF_SIZE_MB }} MB &times; {{ AVG_VERSIONS_PER_DOC }} versions per doc)</span>
          </div>
          <div class="result-recommendation">
            <div class="result-tier">
              <span>Recommended plan:</span>
              <strong>{{ recommendedTier.name }}</strong>
            </div>
            <div v-if="recommendedTier.monthlyPrice !== null" class="result-price">
              <template v-if="isYearly">
                <strong>&euro;{{ recommendedTier.yearlyMonthlyPrice }}/mo</strong>
                <span class="result-savings">Save &euro;{{ recommendedTier.monthlyPrice * 12 - recommendedTier.yearlyTotal }}/year</span>
              </template>
              <template v-else>
                <strong>&euro;{{ recommendedTier.monthlyPrice }}/mo</strong>
                <span class="result-yearly-hint">or &euro;{{ recommendedTier.yearlyMonthlyPrice }}/mo billed yearly</span>
              </template>
            </div>
            <div v-else class="result-price">
              <strong>Custom pricing</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="billing-toggle">
        <span :class="{ active: !isYearly }">Monthly</span>
        <button class="toggle-switch" :class="{ toggled: isYearly }" @click="isYearly = !isYearly">
          <span class="toggle-knob"></span>
        </button>
        <span :class="{ active: isYearly }">Yearly</span>
        <span class="billing-save-badge" :style="{ visibility: isYearly ? 'visible' : 'hidden' }">2 months free</span>
      </div>

      <div class="plans-grid">
        <div class="plan-card">
          <div class="plan-header">
            <h3>Free</h3>
            <div class="plan-price">
              <span class="price">&euro;0</span>
              <span class="period">/month</span>
            </div>
            <div class="plan-price-annual">&nbsp;</div>
          </div>
          <ul class="plan-features">
            <li><i class="pi pi-check"></i> 5 projects, 2 parties each</li>
            <li><i class="pi pi-check"></i> 10 documents per project</li>
            <li><i class="pi pi-cloud"></i> 250 MB storage</li>
            <li><i class="pi pi-check"></i> Comments &amp; annotations</li>
            <li><i class="pi pi-check"></i> Approvals &amp; deadlines</li>
            <li><i class="pi pi-check"></i> Email notifications</li>
            <li><i class="pi pi-check"></i> Custom document types (up to 3)</li>
          </ul>
          <Button label="Get Started" outlined class="plan-button" @click="handleGetStarted" />
        </div>

        <div class="plan-card featured">
          <div class="plan-badge">Recommended</div>
          <div class="plan-header">
            <h3>Team</h3>
            <div class="plan-price">
              <span v-if="isYearly" class="price-original">&euro;49</span>
              <span class="price">&euro;{{ isYearly ? 41 : 49 }}</span>
              <span class="period">/month</span>
            </div>
            <div class="plan-price-annual">
              <template v-if="isYearly">billed &euro;490/year</template>
              <template v-else>&nbsp;</template>
            </div>
          </div>
          <ul class="plan-features">
            <li><i class="pi pi-check"></i> Unlimited projects &amp; parties</li>
            <li><i class="pi pi-check"></i> Unlimited documents</li>
            <li><i class="pi pi-cloud"></i> 10 GB storage</li>
            <li><i class="pi pi-check"></i> Document versioning</li>
            <li><i class="pi pi-check"></i> Document sign-off</li>
            <li><i class="pi pi-check"></i> Unlimited custom document types</li>
          </ul>
          <Button label="Start 14-Day Free Trial" class="plan-button" @click="handleGetStarted('team')" />
        </div>

        <div class="plan-card">
          <div class="plan-header">
            <h3>Business</h3>
            <div class="plan-price">
              <span v-if="isYearly" class="price-original">&euro;149</span>
              <span class="price">&euro;{{ isYearly ? 124 : 149 }}</span>
              <span class="period">/month</span>
            </div>
            <div class="plan-price-annual">
              <template v-if="isYearly">billed &euro;1,490/year</template>
              <template v-else>&nbsp;</template>
            </div>
          </div>
          <ul class="plan-features">
            <li><i class="pi pi-check"></i> Everything in Team</li>
            <li><i class="pi pi-cloud"></i> 100 GB cloud storage</li>
            <li class="storage-divider">or</li>
            <li><i class="pi pi-server"></i> Self-hosted file storage</li>
            <li><i class="pi pi-check"></i> Multiple workspaces</li>
            <li><i class="pi pi-check"></i> Approval stages</li>
            <li><i class="pi pi-code"></i> API access &amp; webhooks</li>
            <li><i class="pi pi-check"></i> Advanced reporting</li>
            <li><i class="pi pi-list"></i> Audit logs</li>
          </ul>
          <Button label="Start 14-Day Free Trial" class="plan-button" @click="handleGetStarted('business')" />
        </div>

        <div class="plan-card">
          <div class="plan-header">
            <h3>Enterprise</h3>
            <div class="plan-price">
              <span class="price">Custom</span>
            </div>
            <div class="plan-price-annual">&nbsp;</div>
          </div>
          <ul class="plan-features">
            <li><i class="pi pi-check"></i> Everything in Business</li>
            <li><i class="pi pi-cloud"></i> Unlimited storage</li>
            <li><i class="pi pi-lock"></i> SSO / SAML</li>
            <li><i class="pi pi-check"></i> Custom SLAs</li>
            <li><i class="pi pi-check"></i> Dedicated support</li>
          </ul>
          <Button label="Contact Sales" outlined class="plan-button" as="a" href="mailto:sales@cedar-stack.com" />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Ready to Get Started?</h2>
        <p>Join teams who trust CedarStack DMS for their document management needs</p>
        <div class="cta-actions">
          <Button
            label="Start Free"
            icon="pi pi-arrow-right"
            iconPos="right"
            size="large"
            @click="handleGetStarted('free')"
          />
        </div>
        <p class="cta-note">No credit card required. 14-day Team trial, then free forever on the Free plan.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <Logo size="sm" />
          <p>Intelligent Document Hub</p>
        </div>
        <div class="footer-links">
          <a href="mailto:support@cedarstack.io">Contact</a>
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
.landing-page {
  min-height: 100vh;
  background-color: var(--surface-ground);
}

/* Hero Section */
.hero {
  padding: 80px 24px;
  background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-ground) 100%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero-badge {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--brand-gold-light);
  color: var(--brand-brown-dark);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.hero-title {
  font-family: 'Inter', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-color);
  margin: 0 0 24px 0;
}

.hero-title .highlight {
  color: var(--primary-color);
}

.hero-description {
  font-size: 18px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.hero-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.card-header i {
  color: var(--brand-gold);
  font-size: 20px;
}

.card-documents {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--surface-ground);
  border-radius: 8px;
  font-size: 14px;
}

.doc-item i {
  color: var(--color-danger);
}

.doc-item span:first-of-type {
  flex: 1;
  color: var(--text-color);
}

.doc-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.doc-status.approved {
  background-color: #dcfce7;
  color: #166534;
}

.doc-status.pending {
  background-color: #e0e7ff;
  color: #3730a3;
}

.doc-status.review {
  background-color: #fef3c7;
  color: #92400e;
}

/* Section Common Styles */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-family: 'Inter', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 16px 0;
}

.section-header p {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0;
}

/* Features Section */
.features-section {
  padding: 80px 24px;
  background-color: var(--surface-card);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.feature-card {
  padding: 32px;
  background-color: var(--surface-ground);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  border-radius: 12px;
  margin-bottom: 20px;
}

.feature-icon i {
  font-size: 24px;
  color: white;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* Plans Section */
.plans-section {
  padding: 80px 24px;
  background-color: var(--surface-ground);
}

/* Pricing Calculator */
.pricing-calculator {
  max-width: 700px;
  margin: 0 auto 48px;
  padding: 32px;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
}

.pricing-calculator h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pricing-calculator h3 i {
  color: var(--primary-color);
}

.calculator-inputs {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 28px;
}

.calc-input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calc-input-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.calc-input-label strong {
  font-size: 16px;
  color: var(--text-color);
}

.calculator-result {
  padding: 20px;
  background-color: var(--surface-ground);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-storage {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color);
}

.result-storage i {
  color: var(--primary-color);
}

.storage-note {
  color: var(--text-secondary);
  font-size: 12px;
}

.result-recommendation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.result-tier {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--text-color);
}

.result-tier strong {
  font-size: 18px;
  color: var(--primary-color);
}

.result-price {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--text-color);
}

.result-savings {
  padding: 2px 10px;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.result-yearly-hint {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Billing Toggle */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
  font-size: 15px;
  color: var(--text-secondary);
}

.billing-toggle span.active {
  color: var(--text-color);
  font-weight: 600;
}

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

.billing-save-badge {
  padding: 4px 12px;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.plans-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.plan-card {
  position: relative;
  padding: 32px;
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
}

.plan-card.featured {
  border-color: var(--primary-color);
  box-shadow: 0 8px 32px rgba(var(--primary-color-rgb), 0.15);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.plan-header {
  text-align: center;
  margin-bottom: 24px;
}

.plan-header h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  min-height: 44px;
}

.plan-price .price {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-color);
}

.plan-price .period {
  font-size: 16px;
  color: var(--text-secondary);
}

.plan-price .price-original {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: line-through;
  margin-right: 4px;
}

.plan-price-annual {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 4px;
  min-height: 20px;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-color);
}

.plan-features li i {
  color: var(--primary-color);
  font-size: 14px;
}

li.storage-divider {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  justify-content: center;
  padding: 0;
}

.plan-button {
  width: 100%;
}

/* Permissions Section */
.permissions-section {
  padding: 80px 24px;
  background-color: var(--surface-card);
}

.permissions-content {
  max-width: 1200px;
  margin: 0 auto 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: start;
}

.permission-diagram {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-layer {
  padding: 20px 24px;
  border-radius: 12px;
  border-left: 4px solid;
}

.layer-org {
  background-color: #f3e8ff;
  border-color: #a855f7;
}

.layer-project {
  background-color: #dbeafe;
  border-color: #3b82f6;
  margin-left: 16px;
}

.layer-party {
  background-color: #fef3c7;
  border-color: #f59e0b;
  margin-left: 32px;
}

.layer-user {
  background-color: #dcfce7;
  border-color: #22c55e;
  margin-left: 48px;
}

.layer-label {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-color);
  margin-bottom: 2px;
}

.layer-description {
  font-size: 13px;
  color: var(--text-secondary);
}

.permission-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-card {
  padding: 20px;
  background-color: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
}

.permission-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.permission-header i {
  font-size: 20px;
  color: var(--primary-color);
}

.permission-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.permission-card p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.permission-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.permission-examples h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 24px 0;
  text-align: center;
}

.example-scenario {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.example-party {
  display: flex;
  gap: 16px;
  padding: 24px;
  background-color: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
}

.party-avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.party-avatar i {
  font-size: 20px;
  color: white;
}


.party-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.party-info strong {
  font-size: 16px;
  color: var(--text-color);
}

.party-info span {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Document Types - Visibility Matrix */
.doctypes-visibility {
  max-width: 600px;
  margin: 0 auto 40px;
}

.visibility-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.visibility-matrix th {
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  color: var(--text-color);
  border-bottom: 2px solid var(--surface-border);
}

.visibility-matrix th i {
  display: block;
  margin-bottom: 4px;
  font-size: 16px;
  color: var(--text-secondary);
}

.visibility-matrix td {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid var(--surface-border);
}

.visibility-matrix td.doc-label {
  text-align: left;
  font-weight: 500;
  color: var(--text-color);
}

.visibility-matrix td .pi-eye {
  color: var(--primary-color);
}

.visibility-matrix td .pi-check-circle {
  color: #27ae60;
}

.visibility-matrix td .pi-minus {
  color: var(--surface-border);
}

.visibility-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.visibility-legend span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.visibility-legend .pi-eye {
  color: var(--primary-color);
  font-size: 12px;
}

.visibility-legend .pi-check-circle {
  color: #27ae60;
  font-size: 12px;
}

.visibility-legend .pi-minus {
  color: var(--surface-border);
  font-size: 12px;
}

/* Document Types Section */
.doctypes-section {
  padding: 80px 24px;
  background-color: var(--surface-ground);
}

.doctypes-intro {
  max-width: 800px;
  margin: 0 auto 32px;
}

.intro-card {
  display: flex;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  border: 1px solid #bae6fd;
}

html.dark .intro-card {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af20 100%);
  border-color: #1e40af;
}

.intro-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 16px;
  flex-shrink: 0;
}

.intro-icon i {
  font-size: 28px;
  color: white;
}

.intro-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.intro-content p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.doctypes-example-label {
  max-width: 1200px;
  margin: 0 auto 16px;
  text-align: center;
}

.doctypes-example-label span {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--surface-card);
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
}

.doctypes-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.doctype-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background-color: var(--surface-card);
  border-radius: 12px;
  text-align: center;
}

.doctype-card i {
  font-size: 32px;
  color: var(--primary-color);
}

.doctype-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.doctype-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.doctype-badge.info {
  background-color: #e0f2fe;
  color: #0369a1;
}

.doctype-badge.approval {
  background-color: #fef3c7;
  color: #92400e;
}

.doctype-badge.signature {
  background-color: #e0e7ff;
  color: #3730a3;
}

/* CTA Section */
.cta-section {
  padding: 80px 24px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.cta-content h2 {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
}

.cta-content p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px 0;
}

.cta-note {
  font-size: 14px !important;
  color: rgba(255, 255, 255, 0.7) !important;
  margin-top: 16px !important;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.cta-actions :deep(.p-button) {
  background-color: white;
  color: var(--primary-color);
  border: none;
}

.cta-actions :deep(.p-button:hover) {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Footer */
.landing-footer {
  padding: 32px 24px;
  background-color: var(--surface-section);
  border-top: 1px solid var(--surface-border);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-brand p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .hero-visual {
    order: -1;
  }

  .hero-title {
    font-size: 36px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 700px;
  }

  .result-recommendation {
    flex-direction: column;
    align-items: flex-start;
  }

  .permissions-content {
    grid-template-columns: 1fr;
  }

  .example-scenario {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 48px 16px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .plans-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .intro-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .footer-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>