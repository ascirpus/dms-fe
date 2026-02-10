# Signatures

CedarStack supports document sign-offs, allowing you to formally acknowledge that you've reviewed a document. Signatures serve as a record of who reviewed what and when.

> **Note:** These are acknowledgment signatures, not legally binding digital signatures. Legal digital signature integration (e.g., eIDAS) is planned for a future release.

## Types of Signatures

### Required Signatures

Admins can designate specific users who **must** sign a document. This is useful when certain stakeholders need to formally acknowledge a document, such as:

- A project manager confirming a scope change
- A department head acknowledging a compliance document
- All parties confirming receipt of a contract

### Voluntary Signatures

Any user with **View** permission on a document can voluntarily sign it to record that they've reviewed it. This doesn't require admin assignment.

## Signing a Document

1. Open the document in the viewer
2. Click **Sign**
3. Your signature is recorded with:
   - Your user ID
   - Timestamp
   - Content hash of the document at the time of signing
   - Your IP address
   - Your browser information

This metadata creates an audit trail proving when and how you signed.

## Assigning Required Signers

Admins (users with Manage Documents capability) can assign required signers:

1. Open the document
2. Go to the signature section
3. Select the users who must sign
4. Optionally set a **signature deadline**

Assigned users will receive a notification that their signature is required.

## Signature Progress in Document Lists

When a document has assigned signatures and is in the **Pending** status, the status tag in the project document list and card view shows signature progress instead of "Pending" — for example, **"2/5 Signatures"**. This gives you an at-a-glance view of how many signatures have been collected without opening the document.

## Signature Status

The signature panel on a document shows:

| Field | Description |
|-------|-------------|
| Required Count | Number of users who must sign |
| Signed Count | Number who have signed so far |
| Pending Count | Required signatures still outstanding |
| Deadline | When signatures must be completed (if set) |

Each signature entry shows who signed and when.

## Signature Deadlines

When a deadline is set, the system sends reminder notifications at **7 days**, **3 days**, and **1 day** before the deadline to users who haven't signed yet.

## Restrictions

- Once a document has been signed, you cannot upload a new file version. This prevents the signed content from being changed after the fact.
- Each user can only sign a document once.

## Notifications

| Event | Who is notified |
|-------|-----------------|
| Signature requested | Assigned users |
| Document signed | Project members |
| Signature deadline approaching (7, 3, 1 days) | Users who haven't signed yet |
