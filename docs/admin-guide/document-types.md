# Document Types

Document types are categories that define how documents behave in your workspace. They control default permissions, approval requirements, and help organize documents visually.

## Default Types

Every new workspace starts with 5 built-in document types:

| Type | Icon | Requires Approval | Default Threshold | Default Permission |
|------|:----:|:-----------------:|:-----------------:|:------------------:|
| Invoice | <i class="pi pi-money-bill"></i> | No | 0 | View |
| Purchase Order | <i class="pi pi-clipboard"></i> | No | 0 | View |
| Contract | <i class="pi pi-file-edit"></i> | No | 0 | View |
| Receipt | <i class="pi pi-receipt"></i> | No | 0 | View |
| Quote | <i class="pi pi-dollar"></i> | Yes | 1 | View |

You can rename or modify these defaults and create additional types. Each type can be assigned a custom icon from the built-in icon picker (36 icons available including document, finance, and organization icons).

Each document type is also automatically assigned a unique color based on its position in your workspace. This color appears on the type's icon everywhere it is shown — document cards, the documents table, party permission lists, and search results — so you can quickly tell types apart at a glance, even if multiple types share the same icon.

## Managing Document Types

*Requires: Manage Settings capability (Admin or Owner)*

Navigate to **Workspace > Settings > Document Types** (`/app/workspace/settings/document-types`).

### Creating a Document Type

1. Click **Add Document Type**
2. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| Name | Yes | Display name (must be unique within your workspace) |
| Icon | No | Visual icon for the type (from the icon picker) |
| Requires Approval | No | Whether documents of this type need approval |
| Default Approval Threshold | No | Number of approvals required (only if approval is enabled) |
| Requires Signature | No | Whether documents need signatures |
| Default Permissions | No | Default permission level for parties (View, Comment, or Decide) |

3. Click **Create**

### Editing a Document Type

Click the pencil icon on a document type to edit any of its fields.

**Settings propagation:** When you update a document type's workflow settings (requires approval, approval threshold, requires signature), the changes automatically propagate to existing documents that haven't been touched yet — meaning documents with no approvals and no signatures. Documents that already have approvals or signatures are not affected, since changing their workflow mid-process could cause confusion.

### Deleting a Document Type

Click the trash icon to delete a type. You'll be asked to confirm.

> **Restriction:** You cannot delete a document type that is currently used by any documents. Remove or reassign those documents first.

## How Document Types Affect Behavior

### Default Permissions

When a new party is added to a project, its permission for each document type defaults to the type's **Default Permission** level. Admins can then adjust permissions per party as needed.

### Approval Configuration

If a document type has **Requires Approval** enabled:
- Documents uploaded with that type will automatically require the configured number of approvals
- Users can override the threshold and set a deadline when uploading individual documents
- Admins can modify the threshold and deadline after upload

### Signature Configuration

If **Requires Signature** is enabled on a type, documents of that type require signatures as a final seal after approval. Once a document is approved and signed, it becomes immutable — no new versions can be uploaded. Signing requires Decide permission.

## Plan Limits

| Plan | Custom Document Types |
|------|-----------------------|
| Free | Up to 3 |
| Team | Unlimited |
| Business | Unlimited |
| Enterprise | Unlimited |

All plans can rename the 5 default types. The limit applies to additional types created beyond the defaults.
