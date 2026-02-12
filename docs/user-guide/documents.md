# Documents

Documents are the core of CedarStack. You upload files to projects, and your team can view, comment on, approve, and sign them based on their permissions.

## Uploading a Document

From a project's detail page, click **Upload Document**. The upload dialog asks for:

| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | A descriptive name for the document |
| File | Yes | The file to upload (e.g., PDF) |
| Document Type | Yes | Category (Invoice, Contract, Quote, etc.) |
| Description | No | Additional context |
| Required Approvals | No | Number of approvals needed (overrides the document type's default) |
| Approval Deadline | No | Date by which approval must be completed |

After clicking **Upload**, the document appears in the project's document list.

### Password-Protected PDFs

If you upload a password-protected PDF, the system will detect it and ask you for the password. A password field will appear in the upload dialog with a message explaining what happened. Enter the correct password and click **Upload** again — the system will unlock the PDF and store the unprotected version so it can be previewed, searched, and annotated.

If you enter the wrong password, you'll see an error and can try again. The password field stays visible until the upload succeeds or you select a different file.

This also applies when uploading a new version in the Document Viewer.

> **Limits:** Upload size and total storage depend on your plan:
> - Free: 10 MB per file, 250 MB total
> - Team: 100 MB per file, 10 GB total
> - Business: 500 MB per file, 100 GB total
> - Enterprise: Unlimited

## Viewing a Document

Click a document in the project list to open the **Document Viewer** (`/app/projects/:id/documents/:documentId`).

The viewer shows:
- **PDF preview** - Inline rendering of the document
- **Document Action Bar** - Shown between the header and PDF when the document has an approval workflow or signatures. Displays approval progress, signature progress, and action buttons (Approve, Decline, Sign Document). Shows status badges (Approved/Declined) when resolved.
- **Document info** - Title, type, description, status, version
- **Sidebar tabs:**
  - **Comments** - Comments and annotations on the document
  - **Versions** - List of all file versions (if versioning is enabled)
  - **Activity** - Chronological timeline of approvals and signatures, including pending signers (only shown when the document has an approval workflow or signatures)

### Viewer Controls

- **Zoom in/out** and page navigation
- **Download** the file
- **Print** the document
- **Share** - Copy the document URL to clipboard
- **Add Version** to upload a new version (Team+ plans)

## Document Versioning

*Requires Team plan or higher.*

When versioning is enabled, uploading a new file to an existing document creates a new version rather than replacing the original. The version history shows:

- Version number
- Upload date
- Who uploaded it

You can view any previous version. Comments are tied to the specific file version they were made on.

On the Free plan, uploading a new file replaces the existing one.

## Document Status

Documents that require approval have a status:

| Status | Meaning | Display |
|--------|---------|---------|
| Pending | Awaiting approvals | Yellow/warn tag showing "Pending" |
| Pending (with signatures) | Awaiting signatures | Yellow/warn tag showing "{signed}/{total} Signatures" (e.g. "2/5 Signatures") |
| Approved | Reached the required approval threshold | Green tag showing "Approved" |
| Declined | Someone with Decide permission declined it | Red tag showing "Declined" |

When a pending document has assigned signatures, the status tag shows signature progress (e.g. "2/5 Signatures") instead of "Pending", giving an at-a-glance view of how many signatures have been collected.

Documents without approval requirements have no status tag.

## Searching Documents

Use the **Search** page (`/app/search`) or the search bar in the header to find documents across your workspace.

Search is **full-text** - it searches within document contents (powered by Apache Tika for text extraction), not just titles. You can:

- Search across all projects
- Scope to a specific project using the project filter
- Click a result to open the document in its project context

Results show the document title, project name, and relevant content snippets.

## Document Types

Every document belongs to a type. Your workspace comes with 5 default types:

| Type | Requires Approval | Default Permission |
|------|-------------------|--------------------|
| Invoice | No | View |
| Purchase Order | No | View |
| Contract | No | View |
| Receipt | No | View |
| Quote | Yes (1 approval) | View |

Admins can customize these and create new types in [Workspace Settings](../admin-guide/document-types.md).

## Deleting a Document

Click the trash icon on a document in the project's document list. Confirm the deletion. This removes the document, all its versions, comments, approvals, and signatures.

> **This action cannot be undone.**

> **Restriction:** Documents that have been approved, declined, or signed cannot be deleted. This protects the audit trail of approval and signature workflows. For approved or declined documents, uploading a new version resets the status back to pending, which allows deletion again. Signed documents are permanently locked — they cannot receive new versions or be deleted.
