# Permissions

CedarStack uses a layered permission system that controls who can view, comment on, and make decisions about documents. Permissions are configured per project and can be fine-tuned per user.

## Permission Levels

There are three permission levels, and each higher level includes the ones below it:

| Level | What it allows |
|-------|---------------|
| **View** | See the document and its contents, download files, view comments and approval history |
| **Comment** | Everything in View, plus add comments and resolve comments |
| **Decide** | Everything in Comment, plus approve or decline documents |

## How Permissions Are Evaluated

When you try to access a document, CedarStack checks permissions in this order:

### 1. Project Membership (required)

You must be a member of the project (assigned to at least one party) to access any of its documents. If you're not in the project, access is denied.

### 2. User Override (highest priority)

Admins can set per-user permission overrides on specific documents. If an override exists for you on a document, it takes precedence over everything else.

| Override | Effect |
|----------|--------|
| View | You can only view, regardless of your party's permissions |
| Comment | You can view and comment |
| Decide | You can view, comment, and decide |
| None | You lose all access to that document, even if your party has permissions |

### 3. Party Permissions

If no user override exists, your access comes from your party memberships. Each party can have permissions set per document type.

If you belong to multiple parties in a project, your permissions are **combined** - you get the highest access from any of your parties. For example, if Party A gives you View on invoices and Party B gives you Decide on invoices, you effectively have Decide.

### 4. Default Permissions

If neither a user override nor party permissions exist for a document type, the document type's **default permission** applies. Most default types ship with View as the default.

## Permission Flow Diagram

```
Can user access document?
    |
    v
Is user in the project?
    |-- No --> Access Denied
    |-- Yes
        |
        v
    Is there a user-specific override for this document?
        |-- Yes --> Use the override permission
        |-- No
            |
            v
        Do any of the user's parties have permissions for this document type?
            |-- Yes --> Combine all party permissions (highest wins)
            |-- No --> Use the document type's default permission
```

## Managing Permissions

### Party Permissions (Project Settings)

Go to a project's **Settings** page to configure party permissions. Each document type is shown with its icon and a unique color so you can quickly identify types when assigning permissions.

Example:

| Party | Invoice | Contract | Quote |
|-------|---------|----------|-------|
| Legal Team | View | Decide | Decide |
| Contractors | View | View | None |
| Client | View | View | View |

### User Permission Overrides

Admins can set overrides for individual users on specific documents. This is useful for:

- Granting a specific person Decide access on a single document
- Revoking access to a sensitive document from certain users
- Temporarily elevating someone's permissions

User overrides are managed through the document's permission settings or the project's user permissions page.

## Admin Bypass

Users with the **Admin** or **Owner** role at the workspace level, or those with the **Manage Documents** capability, bypass document-level permission checks entirely. They can access all documents in any project within their workspace.

System administrators (Keycloak ADMIN role) bypass all permission checks across all workspaces.
