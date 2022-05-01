import { Content } from "./ContentInterface";

export interface Publication {
    id?: number;
    title: string;
    description?: string;
    content: Content[];
    authorId: number;
}