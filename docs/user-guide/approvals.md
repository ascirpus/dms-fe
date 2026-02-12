# Approvals

CedarStack lets you require formal approvals on documents before they're considered finalized. This is useful for contracts, quotes, purchase orders, or any document that needs stakeholder sign-off.

## How Approvals Work

### Setting Up Approvals

Approval requirements can be configured in two places:

1. **Document Type defaults** - When an admin creates or edits a document type, they can set `Requires Approval` and a `Default Approval Threshold`. These settings are snapshotted onto each document when it's created or when a new version is uploaded.

2. **Per-document override** - When uploading a document, you can override the default by specifying a custom number of required approvals and an optional deadline.

### Approval Threshold

The **required approvals** count determines how many people need to approve before the document is marked as approved. For example, if a quote requires 2 approvals, two different users with Decide permission must approve it.

### Approval Deadline

You can optionally set a **deadline** for when approvals must be completed. The system sends reminder notifications at 7 days, 3 days, and 1 day before the deadline.

## Approving a Document

If you have **Decide** permission on a document (the Approve/Decline buttons are only visible when you have this permission):

1. Open the document in the viewer
2. The **Document Action Bar** appears between the header and the PDF viewer, showing the current approval progress (e.g., "2 of 3 approvals")
3. Click **Approve** in the action bar
4. Your approval is recorded with your name and timestamp, and a success toast confirms the action

Each user can only approve once per document.

### What Happens After Approval

When the number of approvals reaches the required threshold, the document's status changes to **Approved** (green badge in the action bar). All project members are notified.

If the document type requires signatures, users with Decide permission can now sign the document to seal it.

### Version-Based Approval Cycle

When a new file version is uploaded to a document, the approval cycle resets:

- All existing approvals and signatures are cleared
- Status returns to **Pending**
- The approval threshold and signature requirements are re-snapshotted from the document type

This ensures every version of the document gets independently reviewed and approved.

## Declining a Document

If you have **Decide** permission (the Decline button is only visible when you have this permission):

1. Open the document in the viewer
2. Click **Decline** in the action bar
3. A dialog appears where you can provide an optional reason explaining why
4. Click **Confirm** to submit

A single decline **immediately** sets the document status to **Declined** (red badge in the action bar), regardless of how many approvals it already has. The decline reason is visible in the activity timeline.

## Viewing Approval History

Open a document and click the **Activity** tab in the sidebar to see the approval history. The timeline shows:

- Who approved or declined, with their avatar
- When they took the action (relative timestamps)
- Any decline comments
- Pending signers who still need to act

The timeline is sorted newest-first, so the most recent actions appear at the top.

## Modifying Approval Settings After Creation

Admins can adjust approval settings on existing documents:

- **Change required approvals** - Increase or decrease the threshold
- **Extend deadline** - Push the approval deadline to a later date

These changes take effect immediately. If the document already has enough approvals to meet a lowered threshold, it will be marked as approved.

> **Note:** Workspace admins can manage approval settings, but approving or declining a document still requires explicit **Decide** permission. The admin role does not bypass this requirement.

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
