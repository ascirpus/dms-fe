import type { ApiError } from '@/types/response';
import type { AxiosError } from 'axios';

export function getApiError(error: unknown): ApiError | null {
    const axiosError = error as AxiosError<{ error?: ApiError }>;
    return axiosError?.response?.data?.error ?? null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    return getApiError(error)?.message ?? fallback;
}
