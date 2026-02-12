# Signatures

CedarStack supports document signatures as a final seal after approval. Once signed, a document becomes immutable — no new versions can be uploaded.

> **Note:** These are acknowledgment signatures, not legally binding digital signatures. Legal digital signature integration (e.g., eIDAS) is planned for a future release.

## How Signatures Work

Signatures follow a clear pipeline: **Upload/Revise -> Approval Cycle -> Signature (seal) -> Immutable**.

1. A document type can be configured with **Requires Signature** enabled
2. When a document of that type is uploaded, the signature requirement is snapshotted onto the document
3. After the document reaches **Approved** status through the approval workflow, users with **Decide** permission can sign it
4. Once signed, the document is locked — no new file versions can be uploaded

## Signing a Document

To sign a document, you need:
- **Decide** permission on the document (workspace admin role does not bypass this — you must have explicit Decide permission via party membership or a user override)
- The document must be in **Approved** status
- The document type must have **Requires Signature** enabled

1. Open the document in the viewer
2. The **Document Action Bar** shows a **Sign Document** button (only visible when the document is approved and requires signature)
3. Click **Sign Document** in the action bar
4. Your signature is recorded with:
   - Your user ID
   - Timestamp
   - Content hash of the document at the time of signing
   - Your IP address
   - Your browser information

This metadata creates an audit trail proving when and how you signed.

## Version Reset

When a new file version is uploaded to a document:
- All existing approvals **and signatures** are cleared
- The approval cycle starts fresh
- Signature requirements are re-snapshotted from the document type

This means a signed document cannot have a new version uploaded — you must start fresh with a new document if you need a different version signed.

## Viewing Signature Activity

Open a document and click the **Activity** tab in the sidebar to see signature activity. The timeline shows who has signed and when.

## Signature Status

The action bar and signature panel on a document show:

| Field | Description |
|-------|-------------|
| Signed Count | Number of users who have signed |
| Deadline | When signatures must be completed (if set) |

Each signature entry shows who signed, when, and the content hash at time of signing.

## Signature Deadlines

When a deadline is set, the system sends reminder notifications at **7 days**, **3 days**, and **1 day** before the deadline to users with Decide permission who haven't signed yet.

## Restrictions

- Once a document has been signed, you cannot upload a new file version. This prevents the signed content from being changed after the fact.
- Signed documents cannot be deleted. This protects the audit trail.
- Each user can only sign a document once.
- Signing requires the document to be **Approved** — you cannot sign a pending or declined document.

## Notifications

| Event | Who is notified |
|-------|-----------------|
| Document signed | Project members |
| Signature deadline approaching (7, 3, 1 days) | Users with Decide permission who haven't signed |
