# Projects

Projects are the primary way to organize documents in CedarStack. Each project acts as a container with its own team, parties, permissions, and document collection.

## Viewing Projects

The **Projects** page (`/app/projects`) shows a table of all projects you have access to:

| Column | Description |
|--------|-------------|
| Name | Project name (click to open) |
| Description | Project description |
| Documents | Number of documents in the project |

You can filter projects by typing in the search bar, and adjust the page size (10, 20, or 50 per page).

## Creating a Project

1. Click **New Project** on the projects page
2. Fill in the dialog:
   - **Name** (required) - A descriptive project name
   - **Description** (optional) - Additional context about the project
3. Click **Create**

The project appears in your list immediately. It starts empty with no documents, parties, or members beyond yourself.

> **Limits:** The number of projects you can create depends on your plan. Free tier allows 5 projects; Team and above are unlimited.

## Project Detail

Click a project to open it. The project detail page shows:

- **Project header** with name and description
- **Document table** listing all documents in the project

### Document Table

| Column | Visibility | Description |
|--------|-----------|-------------|
| Document Name | Always | Title of the document (click to open viewer) |
| Modified Date | Toggleable | When the document was last updated |
| Status | Toggleable | Approval status: Pending (blue), Approved (green), Declined (red) |
| Version | Toggleable | Current version number |

You can toggle column visibility using the column settings icon, filter by status, and search by document name.

### Actions

| Action | How |
|--------|-----|
| Upload a document | Click **Upload Document** |
| Open a document | Click its row |
| Edit a document | Click the pencil icon |
| Delete a document | Click the trash icon (confirmation required) |
| Open project settings | Click **Settings** |

## Project Settings

Project settings let you manage the team structure and permissions for a project. Navigate to a project and click **Settings**.

### Parties

Parties represent real-world groups participating in the project: companies, departments, or teams. Examples: "Legal Department", "ABC Contractors", "Insurance Co."

**Creating a party:**
1. Click **Add Party**
2. Enter the party name and optional details:
   - Description
   - Contact email and phone
   - VAT number
   - Address
3. Click **Create**

**Managing members:**
- Click a party to see its members
- Use **Add Member** to assign workspace users to the party
- Remove members with the remove button

> **Important:** Party membership is separate from document permissions. Adding someone to a party doesn't automatically grant them access to documents. Permissions are configured separately.

### Permissions

Permissions control what each party can do with each document type in the project.

The permissions table shows a grid of **parties** vs. **document types**. For each combination, you can set:

| Level | What it allows |
|-------|---------------|
| None | No access |
| View | Can see the document |
| Comment | Can see and add comments (includes View) |
| Decide | Can approve/decline the document (includes View and Comment) |

See [Permissions](permissions.md) for the full permission system.

## Deleting a Project

Click the trash icon on a project in the list (or from project settings). You'll be asked to confirm. Deleting a project removes all its documents, parties, and permission settings.

> **This action cannot be undone.**
