export type FeatureName = 'DOCUMENT_VERSIONING' | 'OCR_PROCESSING' | 'API_ACCESS' | 'ADVANCED_REPORTING' | 'UNLIMITED_DOCUMENT_TYPES' | 'SELF_STORAGE';

export interface TenantFeature {
    feature: FeatureName;
    enabled: boolean;
    config: Record<string, unknown>;
}

export interface TenantTier {
    id: string;
    name: string;
    rank: number;
    maxProjects: number;
    maxDocumentsPerProject: number;
    maxStorageMb: number;
    maxDocumentSizeMb: number;
    maxUsersPerProject: number;
    maxTenants: number;
    features: TenantFeature[];
}

export interface TenantUsage {
    projectsCount: number;
    documentsCount: number;
    storageUsedMb: number;
}

export interface Tenant {
    id: string;
    name: string;
    tier: TenantTier;
    usage: TenantUsage;
    createdAt: string;
}

export type TenantRole = 'MEMBER' | 'ADMIN' | 'OWNER';

export interface UserTenantSummary {
    tenantId: string;
    name: string;
    role: TenantRole;
    createdAt: string;
}

export interface UserTenantsResponse {
    tenants: UserTenantSummary[];
    lastAccessedTenantId: string | null;
}
