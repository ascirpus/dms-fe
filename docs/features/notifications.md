# Notifications

## Overview

In-app notification system that alerts users about activity on their documents and projects. Users can view notifications, mark them as read, and configure email notification preferences.

## Route

`/notifications`

## Components

- `src/views/user/Notifications.vue` - Notifications page
- `src/components/base/Header.vue` - Notification bell with unread badge
- `src/composables/useNotifications.ts` - Notification state management
- `src/services/NotificationsService.ts` - Notification API calls

## Notification Bell (Header)

The header displays a bell icon button with:
- **Unread badge:** Shows the count of unread notifications
  - Hidden when count is 0
  - Shows the number (e.g., "5") for counts 1-99
  - Shows "99+" for counts over 99
- Clicking the bell navigates to the `/notifications` page

The unread count is fetched on mount when the user is authenticated.

## Notifications Page

### Content

A list of notifications, each showing:

| Element | Description |
|---------|-------------|
| Date | When the notification was created |
| Message | The notification text |
| Mark as read button | Button to mark individual notification as read (only on unread) |

### Actions

| Action | How | Result |
|--------|-----|--------|
| View notifications | Navigate to `/notifications` | See all notifications |
| Mark one as read | Click "Mark as read" on a notification | Notification marked as read, removed from unread count |
| Mark all as read | Click "Mark all as read" button | All notifications marked as read, badge clears |
| Toggle email notifications | Toggle the email notifications switch | Enables/disables email notifications via preferences API |

### Email Preferences

A toggle switch at the top of the notifications page:
- **On:** User receives email notifications for activity
- **Off:** No email notifications (in-app only)

Preference is saved via `PUT /api/notifications/preferences`.

## States

- **Loading:** Spinner while notifications load
- **Empty:** Message "No notifications" when the list is empty
- **With notifications:** Scrollable list of notifications
- **All read:** No unread badge, "mark as read" buttons hidden
