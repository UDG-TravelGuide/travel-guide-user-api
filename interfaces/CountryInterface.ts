import { Coordinate } from "./CoordinateInterface";

export interface Country {
    countryNumericCode: string;
    name: string;
    alphaCode: string;
    region: string;
    subregion: string;
    coordinates: Coordinate;
    spanishName: string;
    flagURL: string;
}