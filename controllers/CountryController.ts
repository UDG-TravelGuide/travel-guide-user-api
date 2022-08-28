// Imports
import { response, request } from 'express';
import { get } from 'https';
import { LOGGER } from '../helpers/Logger';

export const getAllCountries = async( _ = request, res = response ): Promise<void> => {
    const LOGGER_BASE = `getAllCountries@CountryController -`;

    try {
        get(`https://restcountries.com/v3.1/all`, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                res.status(200).json(JSON.parse(data));
            });
        });
    } catch (error) {
        LOGGER.error(`${ LOGGER_BASE } error obtaining countries - Error: ${ error }`);

        res.status(500).json({
            message: {
                cat: `Ha sorgit un error al intentar obtenir les els paisos.`,
                es: `Ha surgido un error al intentar obtener los países.`,
                eng: `An error occurred while trying to get the countries.`
            }
        });
    }
}