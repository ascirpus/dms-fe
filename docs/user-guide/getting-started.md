# Getting Started

## Creating Your Account

### New Organization

If you're setting up CedarStack for your organization:

1. Go to the CedarStack homepage and click **Get Started**
2. Fill in the registration form:
   - **Company Name** - Your organization's name (becomes your workspace name)
   - **Email** - Your work email address
   - **First Name** and **Last Name**
3. Complete the Cloudflare verification
4. Click **Create Account**

You'll be redirected to Keycloak to set your password, then logged into your new workspace. Your account starts with a **14-day Team trial** with full features and no credit card required.

### Joining via Invite

If someone invited you to their workspace:

1. Open the invite link from the email you received
2. You'll see the invitation details: workspace name, who invited you, and any optional message
3. If you don't have a CedarStack account, fill in your details to create one
4. Click **Accept Invite** to join the workspace

You'll be added with the role specified by the person who invited you (typically Member).

## First Login

CedarStack uses **Keycloak single sign-on** for authentication. When you click "Log In" on the homepage, you'll be redirected to the Keycloak login page. Enter your email and password to access your workspace.

After logging in, you'll land on the **Projects** page, which is your main working area.

## Understanding Workspaces

A workspace is your organization's private environment. Everything inside it (projects, documents, members) is isolated from other organizations.

### Workspace Overview

Navigate to **Workspace** in the sidebar to see:

- **Current Plan** - Your subscription tier (Free, Team, Business, or Enterprise)
- **Usage** - How much of your plan's limits you're using:
  - Projects created vs. limit
  - Total documents across all projects
  - Storage used vs. quota

### Switching Workspaces

If you belong to multiple organizations, use the **workspace switcher** in the header to switch between them. Your active workspace determines which projects and documents you see.

## Your Profile

Click your avatar or go to **Profile** to manage your account:

### General Settings
- Update your name, email, and phone number
- Upload a profile picture

### Notification Preferences
- Control which events trigger notifications
- Toggle email notifications per event type
- Events include: document added, document approved, comments, deadline reminders, and more

### Appearance
- Switch between **Light** and **Dark** mode
- The app also respects your system's color scheme preference

## Next Steps

- [Create your first project](projects.md)
- [Upload a document](documents.md)
- [Invite team members](../admin-guide/user-management.md) (requires Admin or Owner role)
