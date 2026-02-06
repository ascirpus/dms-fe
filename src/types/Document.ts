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

export interface Document {
    id: string;
    title: string;
    documentType: DocumentTypeDTO;
    description?: string;
    status: DocumentStatus;
    currentVersion?: CurrentFile;
    versions: FileVersion[];
}
