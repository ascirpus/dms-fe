import type { AxiosInstance, AxiosResponse } from "axios";
import type { ApiResponse } from "@/types/response";

export class ApiService<T> {
    protected apiClient: AxiosInstance;

    constructor(apiClient: AxiosInstance) {
        this.apiClient = apiClient;
    }

    private async unwrapRequest(callback: Function) {
        try {
            return await callback().then((r: AxiosResponse<ApiResponse<T>>) => r.data.data);
        } catch (error) {
            console.error(`Error fetching: ${error}`);
            throw error;
        }
    }

    async fetchAll(uri: string): Promise<T[]> {
        return this.unwrapRequest(async () => await this.apiClient.get<ApiResponse<T[]>>(uri))
    }

    async fetch(uri: string): Promise<T> {
        return this.unwrapRequest(async () => await this.apiClient.get<ApiResponse<T>>(uri))
    }
}
