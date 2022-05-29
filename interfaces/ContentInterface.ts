import { Image } from './ImageInterface';

export interface Content {
    id?: number;
    type: string;
    value: string;
    image?: Image;
    position: number;
}