# Approvals

CedarStack lets you require formal approvals on documents before they're considered finalized. This is useful for contracts, quotes, purchase orders, or any document that needs stakeholder sign-off.

## How Approvals Work

### Setting Up Approvals

Approval requirements can be configured in two places:

1. **Document Type defaults** - When an admin creates or edits a document type, they can set `Requires Approval` and a `Default Approval Threshold`. Every document of that type will inherit these settings.

2. **Per-document override** - When uploading a document, you can override the default by specifying a custom number of required approvals and an optional deadline.

### Approval Threshold

The **required approvals** count determines how many people need to approve before the document is marked as approved. For example, if a quote requires 2 approvals, two different users with Decide permission must approve it.

### Approval Deadline

You can optionally set a **deadline** for when approvals must be completed. The system sends reminder notifications at 7 days, 3 days, and 1 day before the deadline.

## Approving a Document

If you have **Decide** permission on a document:

1. Open the document in the viewer
2. Click **Approve** (or "Confirm Version")
3. Your approval is recorded with your name and timestamp

Each user can only approve once per document.

### What Happens After Approval

When the number of approvals reaches the required threshold, the document's status changes to **Approved** (green tag). All project members are notified.

## Declining a Document

If you have **Decide** permission:

1. Open the document in the viewer
2. Click **Decline**
3. Provide an optional reason explaining why

A single decline **immediately** sets the document status to **Declined** (red tag), regardless of how many approvals it already has. The decline reason is visible in the approval history.

## Viewing Approval History

Open a document to see its approval history, which shows:

- Who approved or declined
- When they took the action
- Any decline comments

## Modifying Approval Settings After Creation

Admins can adjust approval settings on existing documents:

- **Change required approvals** - Increase or decrease the threshold
- **Extend deadline** - Push the approval deadline to a later date

These changes take effect immediately. If the document already has enough approvals to meet a lowered threshold, it will be marked as approved.

## Approval Status Summary

| Status | Meaning |
|--------|---------|
| **Pending** | Document is awaiting approvals. Shows `X of Y` approvals received. |
| **Approved** | Required threshold reached. Document is finalized. |
| **Declined** | At least one user with Decide permission declined the document. |

## Notifications

The following events trigger notifications:

| Event | Who is notified |
|-------|-----------------|
| Document approved | Project members |
| Document declined | Project members |
| Approval deadline approaching (7, 3, 1 days) | Users with Decide permission |

Notification preferences can be customized in your [profile settings](getting-started.md#notification-preferences).
