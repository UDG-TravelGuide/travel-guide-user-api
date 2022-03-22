import { Content } from "./ContentInterface";

export interface Publication {
    title: string;
    description?: string;
    content: Content[];
    authorId: number;
}