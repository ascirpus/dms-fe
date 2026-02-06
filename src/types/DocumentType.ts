export interface DocumentTypeMetaDTO {
  icon?: string;
}

export interface DocumentTypeMetaRequest {
  icon?: string;
}

export interface DocumentTypeDTO {
  id: string;
  name: string;
  requiresApproval: boolean;
  defaultApprovalThreshold: number;
  requiresSignature: boolean;
  defaultPermissions: number;
  meta: DocumentTypeMetaDTO;
}

export interface CreateDocumentTypeRequest {
  name: string;
  requiresApproval?: boolean;
  defaultApprovalThreshold?: number;
  requiresSignature?: boolean;
  defaultPermissions?: number;
  meta?: DocumentTypeMetaRequest;
}

export interface UpdateDocumentTypeRequest {
  name?: string;
  requiresApproval?: boolean;
  defaultApprovalThreshold?: number;
  requiresSignature?: boolean;
  defaultPermissions?: number;
  meta?: DocumentTypeMetaRequest;
}
