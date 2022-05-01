import { Direction } from "./DirectionInterface";

export interface Content {
    id?: number;
    type: string;
    value: string;
    directions?: Direction[];
    position: number;
}