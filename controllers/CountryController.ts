// Imports
import { response, request } from 'express';
import { get } from 'https';

export const getAllCountries = async( _ = request, res = response ): Promise<void> => {
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
        console.error(error);
        res.status(401).json({
            message: `Ha sorgit un error al intentar obtenir les els paisos.`
        });
    }
}