# Billing & Plans

CedarStack offers tiered plans to match your team's needs. Billing is managed at the workspace level by the Owner.

## Plans

|  | Free | Team | Business | Enterprise |
|--|------|------|----------|------------|
| **Price** | Free | EUR 49/month | EUR 149/month | Contact sales |
| **Projects** | 5 | Unlimited | Unlimited | Unlimited |
| **Documents/Project** | 10 | Unlimited | Unlimited | Unlimited |
| **Storage** | 250 MB | 10 GB | 100 GB | Unlimited |
| **File Size Limit** | 10 MB | 100 MB | 500 MB | Unlimited |
| **Custom Doc Types** | Up to 3 | Unlimited | Unlimited | Unlimited |

### Feature Availability

| Feature | Free | Team | Business | Enterprise |
|---------|:----:|:----:|:--------:|:----------:|
| Email Notifications | Yes | Yes | Yes | Yes |
| Per-User Permission Overrides | Yes | Yes | Yes | Yes |
| Document Versioning | - | Yes | Yes | Yes |
| API Access | - | Yes | Yes | Yes |
| AI/MCP Integration | - | Yes | Yes | Yes |
| Webhooks | - | Yes | Yes | Yes |
| Advanced Reporting | - | Yes | Yes | Yes |
| Approval Stages | - | - | Yes | Yes |
| Custom Tenant Roles | - | - | Yes | Yes |
| Bring Your Own Storage (BYOS) | - | - | - | Yes |
| SSO/SAML | - | - | - | Yes |

## Trial Period

New accounts start with a **14-day Team trial**:

- Full Team features and limits
- No credit card required
- After 14 days, the workspace drops to the Free tier
- All data is preserved; gated features become unavailable
- You can upgrade at any time during or after the trial

There is a **7-day grace period** after downgrade before tier-gated features are fully disabled.

## Usage Tracking

View your current usage in **Workspace** (`/app/workspace`):

- **Projects** created vs. limit
- **Documents** total across all projects
- **Storage** used vs. quota

Usage is calculated in real-time. When you approach limits (80%+), the system suggests cleanup actions.

## Limit Enforcement

When you hit a plan limit:

| Limit | What happens |
|-------|-------------|
| Max projects | Cannot create new projects. Existing projects remain accessible. |
| Max documents per project | Cannot upload new documents to that project. |
| Max storage | Cannot upload new files until storage is freed. |
| Max file size | Upload rejected with an error explaining the size limit. |
| Max users per project | Cannot add more members to that project. |

These limits return a **402 Payment Required** error with a message describing the limit and your current usage.

## Managing Your Subscription

*Requires: Owner role (Manage Billing capability)*

Billing is handled through Stripe. From the workspace overview, you can:

- View your current plan
- Upgrade to a higher tier
- After a successful payment, you'll be redirected to a confirmation page
- If payment is cancelled, you'll see a cancellation page with options to retry

For Enterprise plans, contact sales at sales@cedar-stack.com for custom pricing, SLAs, and dedicated support.
