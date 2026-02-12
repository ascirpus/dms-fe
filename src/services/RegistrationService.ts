import axios, { type AxiosInstance } from 'axios';
import type { RegisterCompanyRequest, RegistrationResponse } from '@/types';
import { config } from '@/config';

const API_URL = config.apiUrl;

export class RegistrationService {
    private client: AxiosInstance;

    constructor(client?: AxiosInstance) {
        this.client = client ?? axios.create({ baseURL: API_URL });
    }

    async registerCompany(request: RegisterCompanyRequest): Promise<RegistrationResponse> {
        const response = await this.client.post<{ status: string; data: RegistrationResponse }>(
            '/api/users/register',
            request,
        );
        return response.data.data;
    }
}
