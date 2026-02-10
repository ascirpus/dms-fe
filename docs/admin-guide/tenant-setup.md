# Tenant Setup

A **tenant** (workspace) is your organization's isolated environment in CedarStack. When you first register, a workspace is automatically created with you as the Owner.

## Initial State

When your workspace is created:

- **Plan:** 14-day Team trial (full Team features, no credit card required)
- **Document Types:** 5 defaults are seeded automatically (Invoice, Purchase Order, Contract, Receipt, Quote)
- **Members:** Just you, with the Owner role
- **Usage:** All counters start at zero

After the trial ends, your workspace drops to the Free tier. All data is preserved; tier-gated features (like versioning) become unavailable until you upgrade.

## Workspace Overview

Navigate to **Workspace** (`/app/workspace`) to see:

### Usage Dashboard

| Metric | Description |
|--------|-------------|
| Projects | Number of projects created vs. your plan's limit |
| Documents | Total documents across all projects |
| Storage | Total file storage used vs. your plan's quota |

Usage is calculated in real-time whenever you load the workspace overview.

When usage approaches your plan's limits (80%+), the system shows cleanup suggestions to help you free up space.

### Current Plan

Shows your active tier, its limits, and available features. If on the Free tier, you'll see options to upgrade.

## Workspace Settings

Navigate to **Workspace > Settings** (`/app/workspace/settings`) to configure:

### Document Types

See [Document Types](document-types.md) for managing your workspace's document categories.

### Members

See [User Management](user-management.md) for inviting and managing workspace members.

## Creating Additional Workspaces

If you need separate workspaces (e.g., for different business units), go to **Create Workspace** (`/app/workspace/new`) and provide:

- **Workspace Name** - The name of the new organization

You'll be the Owner of the new workspace. You can switch between workspaces using the workspace switcher in the header.

> **Note:** The number of workspaces per user may be limited by your plan.
