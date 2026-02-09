import type { TenantRole } from './Tenant';

export interface TenantInvite {
  id: string;
  email: string;
  invitedBy: {
    userId: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  role: TenantRole;
  expiresAt: string;
  createdAt: string;
}

export interface UserPendingInvite {
  inviteId: string;
  tenantId: string;
  tenantName: string;
  role: TenantRole;
  expiresAt: string;
  createdAt: string;
}

export interface CreateInviteRequest {
  email: string;
  role?: TenantRole;
}

export interface JoinTenantRequest {
  email: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
}
