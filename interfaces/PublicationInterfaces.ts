import { Content } from "./ContentInterface";
import { Route } from "./RouteInterface";

export interface Publication {
    id?: number;
    title: string;
    description?: string;
    contents: Content[];
    authorId: number;
    route: Route;
    countryAlphaCode: string;
    points?: number;
}