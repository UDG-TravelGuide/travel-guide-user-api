import { Direction } from "./DirectionInterface";

export interface Route {
    id?: number;
    latitudeInitial: number;
    longitudeInitial: number;
    latitudeFinal: number;
    longitudeFinal: number;
    directions: Direction[];
}