import { Direction } from "./DirectionInterface";
import { Image } from './ImageInterface';

export interface Content {
    id?: number;
    type: string;
    value: string;
    directions?: Direction[];
    image?: Image;
    position: number;
}