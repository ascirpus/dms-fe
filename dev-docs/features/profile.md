# User Profile

## Overview

The profile page displays the current user's information and provides an interface to edit personal details. It also shows a summary of the user's document access across projects.

## Route

`/profile`

## Components

- `src/views/user/Profile.vue` - Profile page

## What It Shows

### User Information

| Field | Description |
|-------|-------------|
| First Name | User's first name |
| Last Name | User's last name |
| Email | User's email address |
| Phone Number | User's phone number |
| Profile Created | Account creation date |
| Last Activity | Most recent activity timestamp |

User data is derived from the Keycloak JWT token (name, email, picture).

### Avatar

- If the user has a profile picture, it is displayed as a circular avatar
- If not, the user's initials are shown in a colored circle

### Email Notifications Toggle

A switch to enable/disable email notifications (same as on the notifications page).

### Access Table

Shows the user's document access across projects:

| Column | Description |
|--------|-------------|
| Project | Project name |
| Document | Document name |
| Access Level | User's permission level (View, Comment, Decide) |

## User Interactions

| Action | How | Result |
|--------|-----|--------|
| View profile | Navigate to `/profile` or click "Profile" in user menu | Profile page loads with user data |
| Edit info | Click "Edit" button | Opens edit dialog for general information |
| Save changes | Click "Save" in edit dialog | Updates user information |
| Toggle email | Toggle email notifications switch | Updates notification preferences |

## States

- **Loading:** Spinner while user data loads
- **Loaded:** User information displayed
- **Edit mode:** Edit dialog open with editable fields
