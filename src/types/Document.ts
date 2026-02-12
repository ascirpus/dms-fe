import type { DocumentTypeDTO } from '@/types/DocumentType';

export enum DocumentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
}

export interface CurrentFile {
    id: string;
    filename: string;
    version: number;
    uploadedAt: string;
    uploadedBy: string;
}

export interface FileVersion {
    fileId: string;
    filename: string;
    version: number;
    uploadedAt: string;
}

export interface SignatureUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export interface Signature {
    user: SignatureUser;
    signedAt: string;
    contentHash: string;
}

export interface DocumentApproval {
    id: string;
    user: SignatureUser;
    action: 'APPROVE' | 'DECLINE';
    comment: string | null;
    createdAt: string;
}

export interface SignatureStatus {
    signatures: Signature[];
    signedCount: number;
}

export interface Document {
    id: string;
    title: string;
    documentType: DocumentTypeDTO;
    description?: string;
    status: DocumentStatus | null;
    currentVersion?: CurrentFile;
    versions: FileVersion[];
    signatures?: Signature[];
    approvals?: DocumentApproval[];
    requiredApprovals?: number;
    requiresSignature?: boolean;
    isSigned?: boolean;
    approvalDeadline?: string | null;
    signatureDeadline?: string | null;
    effectivePermission?: 'NONE' | 'VIEW' | 'COMMENT' | 'DECIDE';
}
