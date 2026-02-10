# User Management

Managing users in CedarStack involves inviting people to your workspace, assigning them roles, and organizing them into parties within projects.

## Workspace Roles

| Role | Capabilities |
|------|-------------|
| **Member** | Basic access: can view projects and documents they have permission for |
| **Admin** | Manage users, parties, projects, documents, and workspace settings |
| **Owner** | Everything an Admin can do, plus billing and subscription management |

### Role Capabilities in Detail

| Capability | Member | Admin | Owner |
|-----------|:------:|:-----:|:-----:|
| View projects & documents | Yes | Yes | Yes |
| Invite users | - | Yes | Yes |
| Manage parties | - | Yes | Yes |
| Create/delete projects | - | Yes | Yes |
| Upload/delete documents | - | Yes | Yes |
| Configure settings | - | Yes | Yes |
| Manage billing | - | - | Yes |

## Inviting Users

*Requires: Manage Users capability (Admin or Owner)*

### Sending an Invite

1. Navigate to **Workspace > Settings > Members** (`/app/workspace/settings/members`)
2. Click **Invite User**
3. Fill in the invite form:
   - **Email** (required) - The person's email address
   - **Role** - Member, Admin, or Owner (defaults to Member)
   - **Message** (optional) - A personal note included in the invite email
   - **Project Assignments** (optional) - Pre-assign the user to specific projects and parties upon acceptance
4. Click **Send Invite**

The invited person receives an email with a link to accept the invitation.

### Invite Details

- Invites expire after **7 days** by default
- Pending invites are visible in the Members page
- You can cancel a pending invite before it's accepted
- The invite shows who sent it, when, and the assigned role

### Project Assignments

When creating an invite, you can optionally pre-assign the user to projects and parties. This means when they accept the invite, they'll automatically be added to those projects as members of the specified parties.

## Accepting an Invite

When someone receives an invite:

1. They click the invite link in the email
2. If they don't have a CedarStack account, they create one
3. They review the invitation details (workspace name, inviter, message)
4. They click **Accept**

Upon acceptance, they're added to the workspace with the specified role and any pre-assigned project memberships.

### Viewing Pending Invites (as a recipient)

Users who have been invited but haven't yet accepted can see their pending invites on the main page or via a banner at the top of the app.

## Managing Workspace Members

The **Members** page shows all current workspace members with their:

- Name and email
- Role (Member, Admin, Owner)
- Join date

## Managing Project Teams

Within each project, team management happens through **parties**:

1. **Create parties** that represent real-world groups (Legal, Client, Contractors, etc.)
2. **Add members** from your workspace to parties
3. **Set permissions** for each party per document type

See [Projects > Project Settings](../user-guide/projects.md#project-settings) for details on party and permission management.

> **Important:** A user can be in your workspace but not in any project. They need to be added to at least one party in a project to access that project's documents.
