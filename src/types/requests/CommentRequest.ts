export interface MarkerRequest {
    pageNumber: number;
    position: {
        x: number,
        y: number
    }
}

export interface CommentRequest {
    fileId: string;
    comment: string;
    marker?: MarkerRequest | null;
}
