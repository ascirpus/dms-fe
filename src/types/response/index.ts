export * from './CommentResponse'

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
    error?: ApiError;
}