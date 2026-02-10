import type { TenantRole } from './Tenant';

export interface ProjectPartyAssignment {
  projectId: string;
  partyId: string;
  projectName?: string;
  partyName?: string;
}

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
  projectAssignments?: ProjectPartyAssignment[];
  expiresAt: string;
  createdAt: string;
}

export interface UserPendingInvite {
  inviteId: string;
  tenantId: string;
  tenantName: string;
  role: TenantRole;
  projectAssignments?: ProjectPartyAssignment[];
  expiresAt: string;
  createdAt: string;
}

export interface CreateInviteRequest {
  email: string;
  role?: TenantRole;
  projectAssignments?: ProjectPartyAssignment[];
}

export interface AcceptedInvite {
  projectAssignments: ProjectPartyAssignment[];
}

export interface JoinTenantRequest {
  email: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
}
