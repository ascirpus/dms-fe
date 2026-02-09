import type { UserPermissionOverride } from '@/types/UserPermission';
import { ApiService } from '@/services/ApiService';

export class UserPermissionsService extends ApiService<UserPermissionOverride> {

    async fetchMyOverrides(): Promise<UserPermissionOverride[]> {
        return this.fetchAll('/api/me/permission-overrides');
    }
}
