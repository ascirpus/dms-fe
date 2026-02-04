export interface Notification {
  id: string;
  type: string;
  projectId?: string;
  documentId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationPreferences {
  [eventType: string]: ChannelPreferences;
}

export interface ChannelPreferences {
  web: boolean;
  email: boolean;
}

export interface UnreadCount {
  count: number;
}
