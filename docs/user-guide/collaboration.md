# Collaboration

CedarStack provides tools for teams to discuss and annotate documents directly within the platform.

## Comments

### Adding a Comment

Users with **Comment** permission (or higher) can add comments to documents:

1. Open a document in the viewer
2. Use the comments panel to write your comment
3. Submit the comment

Comments are tied to a specific **file version**, so you always know which version of the document a comment refers to.

### Pinned Annotations

You can pin comments to specific locations on a document page. When adding a comment:

1. Click on a location in the PDF preview
2. A marker appears at that position
3. Write your comment - it will be associated with that marker

Markers show the page number and exact position (x, y coordinates) so team members can see exactly what part of the document is being discussed.

### Resolving Comments

Comments can be marked as **resolved** to indicate that the feedback has been addressed:

1. Find the comment in the comments panel
2. Click **Resolve**

Resolved comments remain visible but are visually distinguished from active comments.

## Notifications

CedarStack keeps you informed about activity in your workspace through web notifications and optional email alerts.

### Notification Center

Click the bell icon in the header or go to **Notifications** (`/app/notifications`) to see your activity feed. You can:

- View all notifications with pagination
- See the unread count badge on the bell icon
- Mark individual notifications as read
- Mark all notifications as read at once

### Notification Types

| Event | Default: Web | Default: Email |
|-------|:------------:|:--------------:|
| Added to a project | Yes | No |
| Removed from a project | Yes | No |
| Document added | Yes | No |
| Document removed | Yes | No |
| New document version | Yes | No |
| Comment added | Yes | No |
| Comment resolved | Yes | No |
| Document approved | Yes | Yes |
| Document declined | Yes | Yes |
| Document signed | Yes | Yes |
| Approval deadline approaching | Yes | Yes |
| Signature deadline approaching | Yes | Yes |

### Customizing Notification Preferences

Go to **Profile > Notifications** to customize which events trigger notifications and whether you receive email alerts:

- Toggle web notifications per event type
- Toggle email notifications per event type
- Deadline-related notifications default to both web and email
- Action events (approve, decline, sign) default to both web and email
- Informational events (document added, comment) default to web only

### Email Notifications

Email notifications are batched with a 15-minute delay to reduce noise. Multiple events happening in quick succession will be grouped rather than sent as individual emails.

Deadline reminders are sent at **7 days**, **3 days**, and **1 day** before the deadline for both approval and signature deadlines.
