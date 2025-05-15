import type { Document } from "./Document";
import type { User } from "./User";

export interface Project {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    documents?: Document[];
    users?: User[];
}