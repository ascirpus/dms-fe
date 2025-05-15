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

export interface Document {
    id: string;
    title: string;
    content: string;
    status: DocumentStatus;

    updatedDate: Date;
    createdAt: Date;
    updatedAt: Date;
    filename: string;
}