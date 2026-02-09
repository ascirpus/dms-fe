export type PermissionLevel = 'NONE' | 'VIEW' | 'COMMENT' | 'DECIDE';

export interface UserPermissionOverride {
  userId: string;
  userEmail: string;
  documentId: string;
  documentTitle: string;
  projectName: string;
  permission: PermissionLevel;
}
