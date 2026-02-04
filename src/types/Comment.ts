import type { User } from "@/types/User.ts";

export interface Comment {
    id: string;
    documentId: string;
    comment: string;
    marker: Marker | null;
    author: User;
    isResolved: boolean;
    createdAt: string;
}

export interface Marker {
    id: string;
    pageNumber: number;
    position: MarkerPosition,
}

export interface MarkerPosition {
    x: number;
    y: number;
}