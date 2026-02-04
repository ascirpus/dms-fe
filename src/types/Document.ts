export enum DocumentStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    DECLINED = 'Declined',
}

export enum DocumentType {
    PROJECT_INFORMATION = 'Project Information',
    DAMAGE_REPORT = 'Damage Report',
    INVENTORY_REPORT = 'Inventory Report',
    QUOTE = 'Quote',
    CONFIRMATION = 'Confirmation',
    HOURS_CONFIRMATION = 'Hour Confirmation',
    INVOICE = 'Invoice'
}

export interface FileVersion {
    id: string;
    filename: string;
    version: number;
    uploadedAt: string;
    uploadedBy: string;
    downloadUrl: string;
}

export interface Document {
    id: string;
    title: string;
    documentTypeId: string;
    description?: string;
    status: DocumentStatus;
    currentVersion?: FileVersion;
    versions: FileVersion[];
}