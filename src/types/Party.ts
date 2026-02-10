export interface PartyMetaDTO {
  contactEmail?: string;
  contactPhone?: string;
  vatNumber?: string;
  address?: string;
}

export interface PartyDTO {
  id: string;
  name: string;
  description?: string;
  meta: PartyMetaDTO;
  createdAt: string;
}

export type PermissionAction = 'VIEW' | 'COMMENT' | 'DECIDE';

export interface PartyPermissionsDTO {
  partyId: string;
  permissions: Record<string, PermissionAction>;
}

export interface PartyUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PartyWithMembers {
  party: PartyDTO;
  members: PartyUserDTO[];
}

export interface ProjectPartyMembers {
  projectId: string;
  parties: PartyWithMembers[];
}

export interface CreatePartyRequest {
  name: string;
  description?: string;
  meta?: PartyMetaDTO;
}

export interface SetPermissionsRequest {
  permissions: Record<string, PermissionAction>;
}
