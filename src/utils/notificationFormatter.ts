import type { Notification } from '@/types/Notification';

export function formatNotificationMessage(notification: Notification): string {
  const type = notification.type;

  switch (type) {
    case 'project.user_added':
      return 'You were added to a project';
    case 'project.user_removed':
      return 'You were removed from a project';
    case 'document.action_date_approaching':
      return 'Document action date approaching';
    case 'document.approval_deadline_approaching':
      return 'Document approval deadline approaching';
    case 'document.signature_deadline_approaching':
      return 'Document signature deadline approaching';
    case 'document.added':
      return 'Document added';
    case 'document.removed':
      return 'Document removed';
    case 'document.updated.version':
      return 'Document version updated';
    case 'document.updated.comment_added':
      return 'Comment added to document';
    case 'document.updated.comment_resolved':
      return 'Comment resolved on document';
    case 'document.approved':
      return 'Document approved';
    case 'document.rejected':
      return 'Document rejected';
    default:
      return type;
  }
}
