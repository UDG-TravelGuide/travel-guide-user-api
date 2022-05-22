import { Content } from "./ContentInterface";
import { Country } from "./CountryInterface";

export interface Publication {
    id?: number;
    title: string;
    description?: string;
    contents: Content[];
    authorId: number;
    countryAlphaCode: string;
}